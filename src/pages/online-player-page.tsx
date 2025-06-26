import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface ParserItem {
  name: string;
  url: string;
}

const PARSER_LIST_KEY = "onlineParserList";

function OnlinePlayerPage() {
  const [searchParams] = useSearchParams();
  const [parserList, setParserList] = useState<ParserItem[]>([]);
  const [selectedParser, setSelectedParser] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const url = searchParams.get('url');

  useEffect(() => {
    // 从localStorage加载解析接口列表
    const list = JSON.parse(localStorage.getItem(PARSER_LIST_KEY) || "[]");
    setParserList(list);
    if (list.length > 0) {
      setSelectedParser(list[0].url);
    }
    if (url) {
      setVideoUrl(url);
      updateIframeUrl(url, list[0]?.url || "");
    }
  }, [url]);

  const updateIframeUrl = (videoUrl: string, parserUrl: string) => {
    const newIframeUrl = parserUrl.replace("{url}", encodeURIComponent(videoUrl));
    setIframeUrl(newIframeUrl);
  };

  const handleParserChange = (value: string) => {
    setSelectedParser(value);
    updateIframeUrl(videoUrl, value);
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };

  const handleVideoUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateIframeUrl(videoUrl, selectedParser);
    }
  };

  if (!url) {
    return (
      <div className="min-h-screen bg-black  flex items-center justify-center pt-16">
        <p>无效的视频地址</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b  pt-16 pb-2 md:pb-8 pr-2 md:pr-8 pl-2 md:pl-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="aspect-video rounded-lg overflow-hidden shadow-xl mb-4">
          <iframe
            src={iframeUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        
        {/* 视频地址输入框 */}
        <div className="bg-background/50 backdrop-blur rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-2">视频地址：</div>
          <Input
            value={videoUrl}
            onChange={handleVideoUrlChange}
            onKeyDown={handleVideoUrlKeyDown}
            placeholder="输入视频地址，按回车切换"
            className="w-full"
          />
        </div>

        {/* 解析接口按钮组 */}
        <div className="bg-background/50 backdrop-blur rounded-lg p-4 pt-0">
          <div className="text-sm text-muted-foreground mb-2">解析接口：</div>
          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-2 pb-2">
              {parserList.map((parser, index) => (
                <Button
                  key={index}
                  variant={selectedParser === parser.url ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => handleParserChange(parser.url)}
                >
                  {parser.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export default OnlinePlayerPage; 