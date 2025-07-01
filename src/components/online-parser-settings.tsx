import React, { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ParserItem {
  name: string;
  url: string;
}

const PARSER_LIST_KEY = "onlineParserList";

const OnlineParserSettings: React.FC = () => {
  const [parserList, setParserList] = useState<ParserItem[]>([]);
  const [newParser, setNewParser] = useState<ParserItem>({ name: "", url: "" });

  useEffect(() => {
    // 初始化解析列表
    const list = JSON.parse(localStorage.getItem(PARSER_LIST_KEY) || "[]");
    setParserList(list);
  }, []);

  const handleAddParser = () => {
    if (!newParser.name.trim() || !newParser.url.trim()) return;
    const updated = [...parserList, { ...newParser }];
    setParserList(updated);
    localStorage.setItem(PARSER_LIST_KEY, JSON.stringify(updated));
    setNewParser({ name: "", url: "" });
  };

  const handleDeleteParser = (idx: number) => {
    const updated = parserList.filter((_, i) => i !== idx);
    setParserList(updated);
    localStorage.setItem(PARSER_LIST_KEY, JSON.stringify(updated));
  };

  return (
    <div>
      <div className="mb-6">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input placeholder="解析站名称" value={newParser.name} onChange={(e) => setNewParser({ ...newParser, name: e.target.value })} />
            <Input placeholder="接口地址" value={newParser.url} onChange={(e) => setNewParser({ ...newParser, url: e.target.value })} />
            <Button className="cursor-pointer" onClick={handleAddParser}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500">接口地址需包含{"{url}"}参数，例如：https://www.pouyun.com/?url={"{url}"}</div>
        </div>
      </div>
      <div className="space-y-2">
        {parserList.map((item, idx) => (
          <div
            key={item.url + idx}
            className="flex items-center gap-3 p-3 rounded-sm hover:bg-accent line-clamp-1">
            <span className="flex-1 line-clamp-1">
              {item.name} <span className="ml-2 text-xs text-gray-400">{item.url}</span>
            </span>
            <button
              className="text-gray-400 hover:text-red-500 p-1"
              onClick={() => handleDeleteParser(idx)}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineParserSettings; 