import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AIModel {
  id: string;
  name: string;
}

const AIModelSettings: React.FC = () => {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [models, setModels] = useState<AIModel[]>([]);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [newModelName, setNewModelName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 加载设置
  useEffect(() => {
    const savedApiUrl = localStorage.getItem("ai_api_url");
    const savedApiKey = localStorage.getItem("ai_api_key");
    const savedModels = localStorage.getItem("ai_models");

    if (savedApiUrl) setApiUrl(savedApiUrl);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedModels) {
      try {
        const parsedModels = JSON.parse(savedModels);
        if (Array.isArray(parsedModels) && parsedModels.length > 0) {
          setModels(parsedModels);
        }
      } catch (error) {
        console.error('解析模型数据失败:', error);
      }
    }
  }, []);

  // 监听状态变化并保存
  useEffect(() => {
    if (models.length > 0 || apiUrl || apiKey) {
      saveSettings();
    }
  }, [apiUrl, apiKey, models]);

  const saveSettings = () => {
    localStorage.setItem("ai_api_url", apiUrl);
    localStorage.setItem("ai_api_key", apiKey);
    localStorage.setItem("ai_models", JSON.stringify(models));
  };

  const handleAddModel = () => {
    if (newModelName.trim()) {
      const newModel: AIModel = {
        id: Date.now().toString(),
        name: newModelName.trim(),
      };
      setModels([...models, newModel]);
      setNewModelName("");
      setIsDialogOpen(false);
    }
  };

  const handleDeleteModel = (id: string) => {
    setModels(models.filter(model => model.id !== id));
  };

  const handleEditModel = (model: AIModel) => {
    setEditingModel(model);
    setNewModelName(model.name);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingModel && newModelName.trim()) {
      setModels(models.map(model => 
        model.id === editingModel.id 
          ? { ...model, name: newModelName.trim() }
          : model
      ));
      setEditingModel(null);
      setNewModelName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-url">API地址</Label>
          <Input
            id="api-url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="请输入API地址"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="api-key">API密钥</Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入API密钥"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">模型列表</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                添加模型
              </Button>
            </DialogTrigger>
            <DialogContent className="z-[100]">
              <DialogHeader>
                <DialogTitle>{editingModel ? "编辑模型" : "添加模型"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="请输入模型名称"
                />
                <Button 
                  onClick={editingModel ? handleSaveEdit : handleAddModel}
                  className="w-full"
                >
                  {editingModel ? "保存" : "添加"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {models.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <span className="line-clamp-1">{model.name}</span>
              <div className="space-x-2  w-[80px] shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditModel(model)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteModel(model.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIModelSettings; 