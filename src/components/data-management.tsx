import React, { useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type LocalStorageData = Record<string, string | object>;

const DataManagement: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearLocalStorage = () => {
    setShowConfirm(true);
  };

  const handleConfirmClear = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleExportData = () => {
    const data: LocalStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key) || '';
        }
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `morphotv-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('数据导出成功');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as LocalStorageData;
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'string') {
            localStorage.setItem(key, value);
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }
        });
        toast.success('数据导入成功');
        window.location.reload();
      } catch {
        toast.error('导入失败：无效的数据格式');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button className="flex-1" variant="outline" onClick={handleExportData}>
          <Download className="w-4 h-4 mr-2" />
          导出数据
        </Button>
        <Button className="flex-1" variant="outline" asChild>
          <label className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            导入数据
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportData}
            />
          </label>
        </Button>
      </div>
      <Button className="w-full" variant="destructive" onClick={handleClearLocalStorage}>
        清空本地数据
      </Button>
      <div className="text-xs text-gray-500 mt-2">此操作将清除所有播放记录和设置，且无法恢复！</div>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="fixed z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空数据</AlertDialogTitle>
            <AlertDialogDescription>此操作将清除所有播放记录和设置，且无法恢复！</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleConfirmClear}>
              确定清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataManagement; 