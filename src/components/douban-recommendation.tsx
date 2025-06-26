import { useEffect, useRef, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RouterUtils } from "@/utils/router";
import { fetchWithProxy } from "@/utils/proxy";

// 定义类型
interface RecommendationItem {
  id: string;
  title: string;
  pic: {
    large: string;
    normal: string;
  };
  rating?: {
    count: number;
    max: number;
    star_count: number;
    value: number;
  };
  is_new?: boolean;
  episodes_info?: string;
  card_subtitle: string;
  type: string;
}

interface Tag {
  category: string;
  selected: boolean;
  types: {
    selected: boolean;
    type: string;
    title: string;
  }[];
  title: string;
}

interface RecommendationResponse {
  category: string;
  tags: Tag[];
  items: RecommendationItem[];
  recommend_tags: {
    category: string;
    selected: boolean;
    type: string;
    title: string;
  }[];
  total: number;
  type: string;
}

export function DoubanRecommendation() {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [secondaryCategoryTabs, setSecondaryCategoryTabs] = useState<{ category: string; title: string; types: { selected: boolean; type: string; title: string }[] }[]>([]);
  const [activePrimaryTab, setActivePrimaryTab] = useState("tv"); // 剧集 或 电影
  const [activeSecondaryCategory, setActiveSecondaryCategory] = useState("tv"); // 例如：最近热门剧集, 热门电影
  const [activeTertiaryTag, setActiveTertiaryTag] = useState("tv"); // 例如：综合, 全部, 华语
  const [pageStart, setPageStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // 新增状态，表示是否还有更多数据
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (title: string) => {
    RouterUtils.navigateTo("/search", { q: title });
  };

  // 获取推荐数据
  const fetchRecommendations = async (primaryCategory: string, secondaryCategory: string, tertiaryType: string, start: number) => {
    setLoading(true);
    try {
      const targetUrl = `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${primaryCategory}?start=${start}&limit=18&category=${secondaryCategory}&type=${tertiaryType}`;
      const response = await fetchWithProxy(targetUrl);
      const data: RecommendationResponse = await response.json();

      if (start === 0) {
        setItems(data.items || []);
        // 提取并设置二级分类标签
        setSecondaryCategoryTabs(data.tags.map((tag) => ({ category: tag.category, title: tag.title, types: tag.types })));

        // 设置默认选中的二级和三级标签
        const defaultSecondaryCategory = data.tags.find((tag) => tag.selected)?.category || (primaryCategory === "tv" ? "tv" : "热门");
        setActiveSecondaryCategory(defaultSecondaryCategory);

        const defaultTertiaryTag = data.tags.find((tag) => tag.category === defaultSecondaryCategory)?.types.find((type) => type.selected)?.type || tertiaryType;
        setActiveTertiaryTag(defaultTertiaryTag);
      } else {
        setItems((prevItems) => [...prevItems, ...(data.items || [])]);
      }
      setHasMore(data.items && data.items.length > 0); // 根据返回数据判断是否还有更多
      return data.items || [];
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setHasMore(false); // 发生错误时也停止加载更多
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    const loadInitialData = async () => {
      setPageStart(0); // 重置页码
      setHasMore(true); // 每次重新加载数据时重置 hasMore 状态
      await fetchRecommendations(activePrimaryTab, activeSecondaryCategory, activeTertiaryTag, 0);
    };
    loadInitialData();
  }, [activePrimaryTab, activeSecondaryCategory, activeTertiaryTag]);

  // 无限滚动
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPageStart((prevPageStart) => prevPageStart + 18); // 每次加载18条
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreRef.current, loading, activePrimaryTab, activeSecondaryCategory, activeTertiaryTag, hasMore]);

  // 当 pageStart 改变时加载更多数据
  useEffect(() => {
    if (pageStart > 0) {
      fetchRecommendations(activePrimaryTab, activeSecondaryCategory, activeTertiaryTag, pageStart);
    }
  }, [pageStart, activePrimaryTab, activeSecondaryCategory, activeTertiaryTag]);

  return (
    <Tabs
      defaultValue="tv"
      className="w-full"
      onValueChange={(value: string) => {
        setActivePrimaryTab(value); // 切换一级分类
        if (value === "tv") {
          setActiveSecondaryCategory("tv"); // 默认剧集二级分类为"最近热门剧集"
          setActiveTertiaryTag("tv"); // 默认剧集三级标签为"综合"
        } else if (value === "movie") {
          setActiveSecondaryCategory("热门"); // 默认电影二级分类为"热门电影"
          setActiveTertiaryTag("全部"); // 默认电影三级标签为"全部"
        }
        setPageStart(0); // 切换Tab时重置页码
        setHasMore(true); // 切换Tab时重置 hasMore 状态
      }}>
      <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-border/30">
        <TabsTrigger
          value="tv" // 剧集
          className="cursor-pointer"
        >
          剧集
        </TabsTrigger>
        <TabsTrigger
          value="movie" // 电影
              className="cursor-pointer"
        >
          电影
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tv" className="mt-4">
        <Tabs
          value={activeSecondaryCategory}
          className="w-full"
          onValueChange={(value: string) => {
            setActiveSecondaryCategory(value); // 切换二级分类
            // Find the default tertiary tag for the selected secondary category
            const currentSecondaryCategory = secondaryCategoryTabs.find((tab) => tab.category === value);
            const defaultTertiaryTag = currentSecondaryCategory?.types.find((type) => type.selected)?.type || currentSecondaryCategory?.types[0]?.type || "tv";
            setActiveTertiaryTag(defaultTertiaryTag);
            setPageStart(0); // 重置页码
            setHasMore(true); // 切换二级分类时重置 hasMore 状态
          }}>
          <TabsList className="flex flex-wrap gap-2 mb-2 bg-transparent border-none p-0 h-auto">
            {secondaryCategoryTabs
              .map((tab) => (
                <TabsTrigger
                  key={tab.category}
                  value={tab.category} // Use category for value
                  className="cursor-pointer data-[state=active]:bg-background">
                  {tab.title}
                </TabsTrigger>
              ))}
          </TabsList>

          {secondaryCategoryTabs
            .filter((tab) => tab.category === activeSecondaryCategory)
            .map((secondaryCategory) => (
              <div key={secondaryCategory.category} className="flex flex-wrap gap-2">
                {secondaryCategory.types.map((tag) => (
                  <Button
                    key={tag.type}
                    variant={activeTertiaryTag === tag.type ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTertiaryTag(tag.type)}
                    className={`cursor-pointer text-sm ${activeTertiaryTag !== tag.type ? "" : ""}`}>
                    {tag.title}
                  </Button>
                ))}
              </div>
            ))}
        </Tabs>
      </TabsContent>

      <TabsContent value="movie" className="mt-4">
        <Tabs
          value={activeSecondaryCategory}
          className="w-full"
          onValueChange={(value: string) => {
            setActiveSecondaryCategory(value);
            // Find the default tertiary tag for the selected secondary category
            const currentSecondaryCategory = secondaryCategoryTabs.find((tab) => tab.category === value);
            const defaultTertiaryTag = currentSecondaryCategory?.types.find((type) => type.selected)?.type || currentSecondaryCategory?.types[0]?.type || "全部";
            setActiveTertiaryTag(defaultTertiaryTag);
            setPageStart(0); // 重置页码
            setHasMore(true); // 切换二级分类时重置 hasMore 状态
          }}>
          <TabsList className="flex flex-wrap gap-2 mb-2 bg-transparent border-none p-0 h-auto">
            {secondaryCategoryTabs
              .map((tab) => (
                <TabsTrigger key={tab.category} value={tab.category} className="cursor-pointer data-[state=active]:bg-background data-[state=active]:border-border/50">
                  {tab.title}
                </TabsTrigger>
              ))}
          </TabsList>

          {secondaryCategoryTabs
            .filter((tab) => tab.category === activeSecondaryCategory)
            .map((secondaryCategory) => (
              <div key={secondaryCategory.category} className="flex flex-wrap gap-2">
                {secondaryCategory.types.map((tag) => (
                  <Button
                    key={tag.type}
                    variant={activeTertiaryTag === tag.type ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTertiaryTag(tag.type)}
                    className={`cursor-pointer text-sm ${activeTertiaryTag !== tag.type ? "" : ""}`}>
                    {tag.title}
                  </Button>
                ))}
              </div>
            ))}
        </Tabs>
      </TabsContent>

      {/* Common item display and load more */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className="gap-0 py-0 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-border bg-card/50 hover:bg-card"
            onClick={() => handleItemClick(item.title)}>
            <div className="relative w-full h-40 md:h-48">
              <img src={item.pic.normal} alt={item.title} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
              {item.rating && item.rating.value > 0 && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="bg-black/70 text-white text-xs border-0">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {item.rating.value.toFixed(1)}
                  </Badge>
                </div>
              )}
              {item.is_new && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="destructive" className="text-xs border-0">
                    新片
                  </Badge>
                </div>
              )}
              {item.episodes_info && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="outline" className="bg-black/70 text-white border-white/30 text-xs">
                    {item.episodes_info}
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.card_subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div ref={loadMoreRef} className="w-full py-8 flex justify-center">
        {loading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
        {!hasMore && !loading && <p className="text-muted-foreground">没有更多数据了</p>}
      </div>
    </Tabs>
  );
}
