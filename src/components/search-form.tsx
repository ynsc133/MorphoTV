import { useState, useRef, useEffect } from "react";
import { Search, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// 定义历史搜索记录的类型
interface SearchHistory {
  term: string;
  timestamp: number;
}

// 从 localStorage 读取历史记录
const loadSearchHistory = (): SearchHistory[] => {
  try {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      return history.slice(0, 6); // 保留最近6条记录
    }
  } catch (error) {
    console.error("Error loading search history:", error);
  }
  return [];
};

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>(loadSearchHistory());
  const [showHistory, setShowHistory] = useState(false);
  const [searchKey, setSearchKey] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 当URL参数或searchKey变化时更新搜索框内容
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams, searchKey]);

  // 保存历史搜索记录到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  }, [searchHistory]);

  // 检查是否是m3u8链接
  const isM3u8Url = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.endsWith(".m3u8") || url.includes(".m3u8");
    } catch {
      return false;
    }
  };

  const handleSearch = (term: string = searchTerm) => {
    if (!term.trim()) return;

    // 检查是否是m3u8链接
    if (isM3u8Url(term)) {
      window.open(`#/simple-play?url=${encodeURIComponent(term)}`, "_blank");
      return;
    }

    // 检查是否是URL
    try {
      new URL(term);
      // 如果是URL但不是m3u8，跳转到在线解析页面
      window.open(`#/online-play?url=${encodeURIComponent(term)}`, "_blank");
      return;
    } catch {
      // 不是URL，按普通搜索处理
    }

    // 增加searchKey以强制触发重新搜索
    setSearchKey((prev: number) => prev + 1);
    // 跳转到搜索结果页面，添加时间戳参数
    navigate(`/search?q=${encodeURIComponent(term)}&t=${Date.now()}`);
    addToSearchHistory(term);
    setShowHistory(false);
    inputRef.current?.blur();
  };

  // 添加搜索历史
  const addToSearchHistory = (term: string) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.term !== term);
      const newHistory = [{ term, timestamp: Date.now() }, ...filtered].slice(0, 10);
      return newHistory;
    });
  };

  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem("searchHistory");
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  };

  // 从历史记录中搜索
  const searchFromHistory = (term: string) => {
    setSearchTerm(term);
    handleSearch(term);
  };

  return (
    <form
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          搜索
        </Label>
        <div className="relative">
          <SidebarInput
            ref={inputRef}
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder="搜索电影、电视剧、视频地址、m3u8地址..."
            className="h-8 pl-7 pr-10 border-border/50 bg-background/50 focus:bg-background focus:border-primary/50"
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/80"
            onClick={() => handleSearch()}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* 搜索历史下拉 */}
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur border border-border/50 rounded-lg shadow-lg z-10 overflow-hidden">
            <div className="flex items-center justify-between p-3 text-sm text-muted-foreground border-b border-border/30">
              <span>搜索历史</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted/80"
                onClick={clearSearchHistory}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent">
              {searchHistory.map((item) => (
                <div
                  key={item.timestamp}
                  className="p-3 hover:bg-muted/50 cursor-pointer text-sm transition-colors"
                  onClick={() => searchFromHistory(item.term)}
                >
                  {item.term}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
