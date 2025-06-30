import { useEffect, useState } from "react";
import { Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ApiSite, Movie } from "@/types";
import { API_SITES } from "@/config/apiSites";
import { fetchWithProxy } from "@/utils/proxy";

const STORAGE_KEY = "playHistory";

interface PlayHistoryItem {
  vodId: string;
  title: string;
  pic: string;
  episode: string;
  source: string;
  timestamp: number;
  sortOrder?: "asc" | "desc";
  skipStart?: number;
  skipEnd?: number;
}

interface DetailApiResponse {
  code: number;
  msg: string;
  list: Movie[];
}

export default function HistoryPage() {
  const [watchHistory, setWatchHistory] = useState<PlayHistoryItem[]>([]);
  const [latestEpisodes, setLatestEpisodes] = useState<Record<string, string>>({});
  const [loadingEpisodes, setLoadingEpisodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setWatchHistory(JSON.parse(raw));
      } catch {
        setWatchHistory([]);
      }
    }
  }, []);

  // 获取影视详情和最新集数
  const fetchLatestEpisode = async (item: PlayHistoryItem) => {
    const key = `${item.vodId}-${item.source}`;
    
    // 如果正在加载或已经获取过，则跳过
    if (loadingEpisodes[key] || latestEpisodes[key]) {
      return;
    }

    setLoadingEpisodes(prev => ({ ...prev, [key]: true }));

    try {
      // 加载默认和自定义站点
      const defaultSites = API_SITES;
      const customSites: ApiSite[] = JSON.parse(localStorage.getItem("customApiSites") || "[]");
      const allSites = [...defaultSites, ...customSites];

      // 查找对应的站点 API
      const foundSite = allSites.find((site) => site.key === item.source);

      if (!foundSite) {
        throw new Error(`未找到源: ${item.source}`);
      }

      const apiBase = foundSite.api;

      // 使用 ac=detail 获取详情
      const targetUrl = `${apiBase}/api.php/provide/vod/?ac=detail&ids=${item.vodId}`;
      const response = await fetchWithProxy(targetUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DetailApiResponse = await response.json();
      
      if (data.code === 1 && data.list && data.list.length > 0) {
        const movie = data.list[0];
        
        // 直接使用 vod_remarks 字段
        if (movie.vod_remarks?.trim()) {
          setLatestEpisodes(prev => ({ 
            ...prev, 
            [key]: movie.vod_remarks!.trim() 
          }));
        }
      }
    } catch (error) {
      console.error(`获取 ${item.title} 的最新集数失败:`, error);
    } finally {
      setLoadingEpisodes(prev => ({ ...prev, [key]: false }));
    }
  };

  // 批量获取所有历史记录的最新集数
  const fetchAllLatestEpisodes = async () => {
    for (const item of watchHistory) {
      await fetchLatestEpisode(item);
    }
  };

  // 组件加载时自动获取最新集数
  useEffect(() => {
    if (watchHistory.length > 0) {
      fetchAllLatestEpisodes();
    }
  }, [watchHistory]);

  const handleDeleteHistory = (item: PlayHistoryItem) => {
    const newHistory = watchHistory.filter(
      (h) => !(h.vodId === item.vodId && h.episode === item.episode && h.timestamp === item.timestamp)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    setWatchHistory(newHistory);
    
    // 清理相关的缓存数据
    const key = `${item.vodId}-${item.source}`;
    setLatestEpisodes(prev => {
      const newEpisodes = { ...prev };
      delete newEpisodes[key];
      return newEpisodes;
    });
    setLoadingEpisodes(prev => {
      const newLoading = { ...prev };
      delete newLoading[key];
      return newLoading;
    });
  };

  const handleClearAll = () => {
    if (confirm("确定要清空所有观看历史吗？此操作不可恢复。")) {
      localStorage.removeItem(STORAGE_KEY);
      setWatchHistory([]);
      setLatestEpisodes({});
      setLoadingEpisodes({});
    }
  };

  const handleContinueWatch = (item: PlayHistoryItem) => {
    window.location.hash = `play?vodId=${item.vodId}&epNum=${encodeURIComponent(item.episode)}&source=${encodeURIComponent(item.source)}`;
  };

  // 获取站点名称
  const getSiteName = (sourceKey: string): string => {
    // 先检查默认站点
    const defaultSite = API_SITES.find((site) => site.key === sourceKey);
    if (defaultSite) return defaultSite.name;

    // 再检查自定义站点
    try {
      const customSites = JSON.parse(localStorage.getItem("customApiSites") || "[]") as ApiSite[];
      const customSite = customSites.find((site) => site.key === sourceKey);
      if (customSite) return customSite.name;
    } catch {
      // 忽略解析错误
    }

    return "未知站点";
  };

  // 获取最新集数显示文本
  const getLatestEpisodeText = (item: PlayHistoryItem) => {
    const key = `${item.vodId}-${item.source}`;
    const latestEpisode = latestEpisodes[key];
    
    if (latestEpisode) {
      return latestEpisode;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">观看历史</h1>
          </div>
          {watchHistory.length > 0 && (
            <div className="flex gap-2">
              
              <Button 
                variant="outline" 
                onClick={handleClearAll} 
                className="border-border/50 hover:border-border"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清空历史
              </Button>
            </div>
          )}
        </div>

        {watchHistory.length === 0 ? (
          <Alert className="border-border/50 bg-muted/30">
            <AlertDescription>还没有观看记录，去首页发现精彩内容吧！</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6  gap-4">
            {watchHistory.map((item) => (
              <Card
                key={item.vodId + item.episode + item.timestamp}
                className="gap-0 py-0 overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-border bg-card/50 hover:bg-card"
              >
                <div className="relative w-full h-48">
                  <img
                    src={item.pic}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x400/333/fff?text=No+Image";
                    }}
                  />

                  {/* 最新集数信息 - 左上角 */}
                  {getLatestEpisodeText(item) && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="destructive" className="text-xs border-0">
                        {getLatestEpisodeText(item)}
                      </Badge>
                    </div>
                  )}

                  {/* 悬浮操作按钮 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button onClick={() => handleContinueWatch(item)} size="sm" className="mr-2">
                      <Play className="w-4 h-4 mr-1" />
                      继续观看
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteHistory(item)}
                      className="border-white/30  hover:bg-white/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* 观看进度 */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="bg-black/70 text-white border-white/30 text-xs">
                      {item.episode}
                    </Badge>
                  </div>

                  {/* 采集站 */}
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="outline" className="bg-black/70 text-white border-white/30 text-xs">
                      {getSiteName(item.source)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 