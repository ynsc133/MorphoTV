import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Upload, Download, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchSite {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  extractionType?: 'tg' | 'ai';
}

interface AIModel {
  id: string;
  name: string;
}

const CloudDriveSettings: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [sites, setSites] = useState<SearchSite[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [editingSite, setEditingSite] = useState<SearchSite | null>(null);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteUrl, setNewSiteUrl] = useState("");
  const [newSiteExtractionType, setNewSiteExtractionType] = useState<'tg' | 'ai'>('tg');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 监听localStorage中AI模型列表的变化
  useEffect(() => {
    const handleStorageChange = () => {
      const savedModels = localStorage.getItem("ai_models");
      if (savedModels) {
        const parsedModels = JSON.parse(savedModels);
        setModels(parsedModels);
        
        if (selectedModel && !parsedModels.find((model: AIModel) => model.id === selectedModel)) {
          setSelectedModel("");
          saveSettings();
        }
      }
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    const intervalId = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [selectedModel]);

  // 加载其他设置
  useEffect(() => {
    const savedModel = localStorage.getItem("tg_selected_model");
    const savedPrompt = localStorage.getItem("tg_prompt");
    const savedSites = localStorage.getItem("search_sites");

    if (savedModel) setSelectedModel(savedModel);
    if (savedPrompt) setPrompt(savedPrompt);
    
    // 处理站点数据
    if (savedSites) {
      try {
        const parsedSites = JSON.parse(savedSites);
        console.log('解析前的站点数据:', savedSites);
        console.log('解析后的站点数据:', parsedSites);
        
        if (Array.isArray(parsedSites) && parsedSites.length > 0) {
          const sitesWithEnabled = parsedSites.map((site: SearchSite) => {
            console.log('处理站点:', site);
            return {
              ...site,
              enabled: site.enabled ?? true
            };
          });
          console.log('最终设置的站点数据:', sitesWithEnabled);
          setSites(sitesWithEnabled);
        }
      } catch (error) {
        console.error('解析站点数据失败:', error);
      }
    }
  }, []);

  // 修改保存设置的函数
  const saveSettings = () => {
    if (sites.length > 0) {
      console.log('保存设置前的站点数据:', sites);
      localStorage.setItem("tg_selected_model", selectedModel);
      localStorage.setItem("tg_prompt", prompt);
      localStorage.setItem("search_sites", JSON.stringify(sites));
      console.log('保存设置后的站点数据:', JSON.parse(localStorage.getItem("search_sites") || '[]'));
    }
  };

  // 修改状态变化的监听
  useEffect(() => {
    if (sites.length > 0) {
      saveSettings();
    }
  }, [selectedModel, prompt, sites]);

  const handleAddSite = () => {
    if (newSiteName.trim() && newSiteUrl.trim()) {
      const newSite: SearchSite = {
        id: Date.now().toString(),
        name: newSiteName.trim(),
        url: newSiteUrl.trim(),
        enabled: true,
        extractionType: newSiteExtractionType || 'tg',
      };
      setSites([...sites, newSite]);
      setNewSiteName("");
      setNewSiteUrl("");
      setNewSiteExtractionType('tg');
      setIsDialogOpen(false);
    }
  };

  const handleToggleSite = (id: string) => {
    setSites(sites.map(site => 
      site.id === id 
        ? { ...site, enabled: !site.enabled }
        : site
    ));
  };

  const handleDeleteSite = (id: string) => {
    setSites(sites.filter(site => site.id !== id));
  };

  const handleEditSite = (site: SearchSite) => {
    setEditingSite(site);
    setNewSiteName(site.name);
    setNewSiteUrl(site.url);
    setNewSiteExtractionType(site.extractionType || 'tg');
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingSite && newSiteName.trim() && newSiteUrl.trim()) {
      setSites(sites.map(site => 
        site.id === editingSite.id 
          ? { ...site, name: newSiteName.trim(), url: newSiteUrl.trim(), extractionType: newSiteExtractionType || 'tg' }
          : site
      ));
      setEditingSite(null);
      setNewSiteName("");
      setNewSiteUrl("");
      setNewSiteExtractionType('tg');
      setIsDialogOpen(false);
    }
  };

  const handleExportSites = () => {
    const sitesData = JSON.stringify(sites, null, 2);
    const blob = new Blob([sitesData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search-sites.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('站点配置导出成功');
  };

  const handleImportSites = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSites = JSON.parse(e.target?.result as string);
        
        // 验证导入的数据格式
        if (!Array.isArray(importedSites)) {
          throw new Error('导入的数据格式不正确');
        }

        const validatedSites = importedSites.map((site: Partial<SearchSite>) => ({
          id: site.id || Date.now().toString(),
          name: site.name || '',
          url: site.url || '',
          enabled: site.enabled ?? true,
          extractionType: site.extractionType || 'tg',
        }));

        setSites(validatedSites);
        toast.success('站点配置导入成功');
      } catch (error) {
        console.error('导入站点数据失败:', error);
        toast.error('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
    
    // 重置文件输入，允许重复导入相同文件
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-model">AI模型</Label>
          <Select value={selectedModel} onValueChange={(value) => {
            setSelectedModel(value);
            saveSettings();
          }}>
            <SelectTrigger>
              <SelectValue placeholder="选择AI模型" />
            </SelectTrigger>
            <SelectContent className="z-[120]">
              {models.length > 0 ? (
                models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  暂无可用模型
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {models.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              请先在AI模型服务中添加模型
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">提示词</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setPrompt(e.target.value);
              saveSettings();
            }}
            placeholder="请输入额外的过滤条件"
            className="min-h-[100px]"
          />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>提示：您可以在这里添加额外的过滤条件，这些条件会被添加到基础提示词中。示例：</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>过滤掉夸克网盘的资源</li>
              <li>只保留阿里云网盘和百度网盘的资源</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">站点列表</h3>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSites(sites.map(site => ({ ...site, enabled: true })))}
                    className="h-8 w-8"
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="z-[70]">
                  <p>全部启用</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSites(sites.map(site => ({ ...site, enabled: false })))}
                    className="h-8 w-8"
                  >
                    <PowerOff className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="z-[70]">
                  <p>全部禁用</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <input
              type="file"
              accept=".json"
              onChange={handleImportSites}
              style={{ display: 'none' }}
              id="import-sites"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => document.getElementById('import-sites')?.click()}
                    className="h-8 w-8"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="z-[70]">
                  <p>导入配置</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleExportSites}
                    className="h-8 w-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="z-[70]">
                  <p>导出配置</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="z-[70]">
                    <p>添加站点</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DialogContent className="z-[100]">
                <DialogHeader>
                  <DialogTitle>{editingSite ? "编辑站点" : "添加站点"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">站点名称</Label>
                    <Input
                      id="site-name"
                      value={newSiteName}
                      onChange={(e) => setNewSiteName(e.target.value)}
                      placeholder="请输入站点名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-url">站点地址</Label>
                    <Input
                      id="site-url"
                      value={newSiteUrl}
                      onChange={(e) => setNewSiteUrl(e.target.value)}
                      placeholder="请输入站点地址，可使用 {keyword} 作为关键词占位符"
                    />
                    <p className="text-sm text-muted-foreground">
                      提示：在URL中使用 {"{keyword}"} 作为关键词占位符，搜索时会自动替换为实际搜索词
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-extraction-type">提取方式</Label>
                    <Select
                      value={newSiteExtractionType}
                      onValueChange={(value) => setNewSiteExtractionType(value as 'tg' | 'ai')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择提取方式" />
                      </SelectTrigger>
                      <SelectContent className="z-[120]">
                        <SelectItem value="tg">TG频道规则</SelectItem>
                        <SelectItem value="ai">AI模型</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={editingSite ? handleSaveEdit : handleAddSite}
                    className="w-full"
                  >
                    {editingSite ? "保存" : "添加"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-2">
          {sites.map((site) => (
            <div
              key={site.id}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="font-medium  line-clamp-1">{site.name}</div>
                <div className="text-sm text-gray-500 break-all  line-clamp-1">{site.url}</div>
              </div>
              <div className="flex items-center space-x-4 w-[130px] shrink-0 ml-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={site.enabled}
                    onCheckedChange={() => handleToggleSite(site.id)}
                  />
                </div>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSite(site)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSite(site.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CloudDriveSettings; 