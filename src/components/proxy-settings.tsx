import React, { useState, useEffect } from "react";
import { Trash2, Plus, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProxyItem {
  name: string;
  url: string;
}

const PROXY_LIST_KEY = "m3u8ProxyList";
const PROXY_SELECTED_KEY = "m3u8ProxySelected";

const ProxySettings: React.FC = () => {


  // 代理设置相关
  const [proxyList, setProxyList] = useState<ProxyItem[]>([]);
  const [selectedProxy, setSelectedProxy] = useState<string>("");
  const [newProxy, setNewProxy] = useState<ProxyItem>({ name: "", url: "" });
  const handleSelectProxy = (url: string) => {
    setSelectedProxy(url);
    localStorage.setItem(PROXY_SELECTED_KEY, url);
  };

  useEffect(() => {
    // 初始化代理列表和选中项
    const list = JSON.parse(localStorage.getItem(PROXY_LIST_KEY) || "[]");
    setProxyList(list);
    setSelectedProxy(localStorage.getItem(PROXY_SELECTED_KEY) || "");
  }, []);

  const handleAddProxy = () => {
    if (!newProxy.name.trim() || !newProxy.url.trim()) return;
    const updated = [...proxyList, { ...newProxy }];
    setProxyList(updated);
    localStorage.setItem(PROXY_LIST_KEY, JSON.stringify(updated));
    setNewProxy({ name: "", url: "" });
  };

  const handleDeleteProxy = (idx: number) => {
    const updated = proxyList.filter((_, i) => i !== idx);
    setProxyList(updated);
    localStorage.setItem(PROXY_LIST_KEY, JSON.stringify(updated));
    // 如果删除的是当前选中，重置为不代理
    if (proxyList[idx].url === selectedProxy) {
      setSelectedProxy("");
      localStorage.setItem(PROXY_SELECTED_KEY, "");
    }
  };
  return (
    <div>
      <div className="mb-6">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input placeholder="代理名称" value={newProxy.name} onChange={(e) => setNewProxy({ ...newProxy, name: e.target.value })} />
            <Input placeholder="代理地址" value={newProxy.url} onChange={(e) => setNewProxy({ ...newProxy, url: e.target.value })} />

            <Button className="cursor-pointer" onClick={handleAddProxy}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500">留空即不代理，代理地址需支持M3U8转发</div>
        </div>
      </div>
      <div className="space-y-2">
        <div
          className={`flex items-center gap-3 p-3 rounded-sm cursor-pointer ${selectedProxy === "" ? "bg-accent text-primary" : "hover:bg-accent "}`}
          onClick={() => handleSelectProxy("")}>
          <CheckCircle2 className="w-4 h-4 mr-1" /> 不代理
        </div>
        {proxyList.map((item, idx) => (
          <div
            key={item.url + idx}
            className={`flex items-center gap-3 p-3 rounded-sm  cursor-pointer ${
              selectedProxy === item.url ? "bg-accent text-primary " : "hover:bg-accent"
            }`}
            onClick={() => handleSelectProxy(item.url)}>
            <CheckCircle2 className="w-4 h-4 mr-1" />
            <span className="flex-1">
              {item.name} <span className="ml-2 text-xs text-gray-400">{item.url}</span>
            </span>
            <button
              className="text-gray-400 hover:text-red-500 p-1"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProxy(idx);
              }}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProxySettings;
