import React, { useState } from "react";
import { Upload, Link as LinkIcon, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface InitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InitDialog: React.FC<InitDialogProps> = ({ open, onOpenChange }) => {
  const [jsonData, setJsonData] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        handleImportData(data);
      } catch {
        toast.error('导入失败：无效的数据格式');
      }
    };
    reader.readAsText(file);
  };

  const handleImportFromJson = () => {
    try {
      const data = JSON.parse(jsonData);
      handleImportData(data);
    } catch {
      toast.error('导入失败：无效的JSON格式');
    }
  };

  const handleImportFromUrl = async () => {
    try {
      const response = await fetch(remoteUrl);
      const data = await response.json();
      handleImportData(data);
    } catch {
      toast.error('导入失败：无法从URL获取数据');
    }
  };

  const handleImportData = (data: Record<string, string | number | boolean | object>) => {
    try {
      if (data.PROXY_BASE_URL) {
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'string') {
            localStorage.setItem(key, value);
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }
        });
        toast.success('初始化成功');
        onOpenChange(false);
        window.location.reload();
      } else {
        toast.error('导入失败：缺少必要的代理地址配置');
      }
    } catch {
      toast.error('导入失败：数据处理错误');
    }
  };

  // 检查是否已初始化
  const isInitialized = !!localStorage.getItem('PROXY_BASE_URL');

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // 只有在已初始化的情况下才允许关闭对话框
        if (isInitialized) {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[500px] [&>button]:hidden" 
        onPointerDownOutside={(e) => {
          // 阻止点击外部关闭对话框
          if (!isInitialized) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>系统初始化</DialogTitle>
          <DialogDescription>
            请选择一种方式完成系统初始化配置
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="json" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="json">JSON数据</TabsTrigger>
            <TabsTrigger value="file">上传文件</TabsTrigger>
            <TabsTrigger value="url">远程地址</TabsTrigger>
          </TabsList>
          <TabsContent value="json" className="space-y-4 max-w-[450px] mx-auto">
            <Textarea
              placeholder={`请输入JSON配置数据，例如：
{
  "PROXY_BASE_URL": "http://your-proxy-server.com/api/proxy"
}`}
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="h-[200px] w-full overflow-y-auto font-mono text-sm"
            />
            <Button className="w-full" onClick={handleImportFromJson}>
              <FileJson className="w-4 h-4 mr-2" />
              导入JSON数据
            </Button>
          </TabsContent>
          <TabsContent value="file" className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="w-full">
                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2" />
                    <p className="mb-2 text-sm">点击或拖拽文件到此处</p>
                    <p className="text-xs text-muted-foreground">JSON 文件</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".json"
                    onChange={handleImportFromFile}
                  />
                </div>
              </label>
            </div>
          </TabsContent>
          <TabsContent value="url" className="space-y-4">
            <Input
              placeholder="请输入远程JSON配置地址"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
            />
            <Button className="w-full" onClick={handleImportFromUrl}>
              <LinkIcon className="w-4 h-4 mr-2" />
              从远程地址导入
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InitDialog; 