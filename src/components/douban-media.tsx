import { useEffect, useRef, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RouterUtils } from "@/utils/router";
import { fetchWithProxy } from "@/utils/proxy";

// 定义类型
interface MediaItem {
  id: string;
  title: string;
  cover: string;
  rate?: string;
  url?: string;
  is_new?: boolean;
  currentEpisode?: number;
  totalEpisodes?: number;
}

// 分类数据
const movieCategories = [
  { id: "热门", name: "热门" },
  { id: "最新", name: "最新" },
  { id: "动漫", name: "动漫" },
  { id: "豆瓣高分", name: "豆瓣高分" },
];

const tvCategories = [
  { id: "热门", name: "热门" },
  { id: "国产剧", name: "国产剧" },
  { id: "综艺", name: "综艺" },
  { id: "美剧", name: "美剧" },
];

export function DoubanMedia() {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [activeMovieCategory, setActiveMovieCategory] = useState("热门");
  const [activeTvCategory, setActiveTvCategory] = useState("热门");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("movies");

  const handleMediaClick = (title: string) => {
    RouterUtils.navigateTo('/search',{q:title});
  };

  // 获取电影数据
  const fetchMovies = async (category: string, pageStart: number = 0) => {
    setLoading(true);
    try {
      const targetUrl = `https://movie.douban.com/j/search_subjects?type=movie&tag=${encodeURIComponent(category)}&sort=recommend&page_limit=18&page_start=${pageStart}`;
      const response = await fetchWithProxy(targetUrl);
      const data = await response.json();
      return data.subjects || [];
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 获取电视剧数据
  const fetchTvShows = async (category: string, pageStart: number = 0) => {
    setLoading(true);
    try {
      const targetUrl = `https://movie.douban.com/j/search_subjects?type=tv&tag=${encodeURIComponent(category)}&sort=recommend&page_limit=18&page_start=${pageStart}`;
      const response = await fetchWithProxy(targetUrl);
      const data = await response.json();
      return data.subjects || [];
    } catch (error) {
      console.error('Error fetching tv shows:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 加载更多电影
  const loadMoreMovies = async () => {
    if (loading) return;
    const newMovies = await fetchMovies(activeMovieCategory, page * 18);
    setMovies([...movies, ...newMovies]);
    setPage(page + 1);
  };

  // 加载更多电视剧
  const loadMoreTvShows = async () => {
    if (loading) return;
    const newShows = await fetchTvShows(activeTvCategory, page * 18);
    setTvShows([...tvShows, ...newShows]);
    setPage(page + 1);
  };

  // 初始加载数据
  useEffect(() => {
    const loadInitialData = async () => {
      setPage(1);
      const initialMovies = await fetchMovies(activeMovieCategory);
      const initialTvShows = await fetchTvShows(activeTvCategory);
      setMovies(initialMovies);
      setTvShows(initialTvShows);
    };
    loadInitialData();
  }, [activeMovieCategory, activeTvCategory]);

  // 无限滚动
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (activeTab === "movies") {
            loadMoreMovies();
          } else {
            loadMoreTvShows();
          }
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreRef.current, activeTab, activeMovieCategory, activeTvCategory, page, loading]);

  return (
    <Tabs defaultValue="movies" className="w-full" onValueChange={(value: string) => setActiveTab(value)}>
      <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-border/30">
        <TabsTrigger
          value="movies"
          className="data-[state=active]:bg-background data-[state=active]:border-border/50"
        >
          热门电影
        </TabsTrigger>
        <TabsTrigger value="tv" className="data-[state=active]:bg-background data-[state=active]:border-border/50">
          热门电视剧
        </TabsTrigger>
      </TabsList>

      <TabsContent value="movies" className="mt-6">
        {/* 电影分类标签 */}
        <div className="flex gap-2 mb-6">
          {movieCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeMovieCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMovieCategory(category.id)}
              className={activeMovieCategory !== category.id ? "border-border/50 hover:border-border" : ""}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <Card
              key={movie.id}
              className="gap-0 py-0 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-border bg-card/50 hover:bg-card"
              onClick={() => handleMediaClick(movie.title)}
            >
              <div className="relative w-full h-40 md:h-48">
                <img
                  src={movie.cover}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {movie.rate && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant="secondary" className="bg-black/70 text-white text-xs border-0">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {movie.rate}
                    </Badge>
                  </div>
                )}
                {movie.is_new && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="destructive" className="text-xs border-0">
                      新片
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-2">{movie.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
        <div ref={loadMoreRef} className="w-full py-8 flex justify-center">
          {loading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
        </div>
      </TabsContent>

      <TabsContent value="tv" className="mt-6">
        {/* 电视剧分类标签 */}
        <div className="flex gap-2 mb-6">
          {tvCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeTvCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTvCategory(category.id)}
              className={activeTvCategory !== category.id ? "border-border/50 hover:border-border" : ""}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tvShows.map((show) => (
            <Card
              key={show.id}
              className="gap-0 py-0 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-border bg-card/50 hover:bg-card"
              onClick={() => handleMediaClick(show.title)}
            >
              <div className="relative w-full h-40 md:h-48">
                <img
                  src={show.cover}
                  alt={show.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {show.rate && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant="secondary" className="bg-black/70 text-white text-xs border-0">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {show.rate}
                    </Badge>
                  </div>
                )}
                {show.is_new && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="destructive" className="text-xs border-0">
                      新片
                    </Badge>
                  </div>
                )}
                {show.currentEpisode && show.totalEpisodes && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="bg-black/70 text-white border-white/30 text-xs">
                      更新至{show.currentEpisode}集
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-2">{show.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
        <div ref={loadMoreRef} className="w-full py-8 flex justify-center">
          {loading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
        </div>
      </TabsContent>
    </Tabs>
  );
} 