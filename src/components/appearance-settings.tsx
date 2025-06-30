import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { themeManager, ThemeName } from "@/utils/theme-manager";

// 自动生成主题色方案列表
const colorSchemes = Object.entries(themeManager.themes).map(([key, value]) => ({
  value: key,
  label: value.label || key,
}));

// 读取某个主题的主色
function getThemeColors(themeName: string) {
  const theme = (themeManager.themes as Record<string, { light: Record<string, string>; dark: Record<string, string> }>)[themeName];
  if (!theme) return ["#ccc", "#ccc", "#ccc", "#ccc"];
  const mode = document.documentElement.classList.contains("dark") ? "dark" : "light";
  const vars = theme[mode];
  return [vars["--primary"] || "#ccc", vars["--accent"] || "#ccc"];
}

const AppearanceSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [colorScheme, setColorScheme] = useState("amethyst-haze");

  useEffect(() => {
    const savedColorScheme = themeManager.getCurrentTheme();
    setColorScheme(savedColorScheme);
  }, []);

  const handleColorSchemeChange = (value: ThemeName) => {
    try {
      themeManager.switchTheme(value);
      setColorScheme(value);
    } catch (error) {
      console.error("切换主题失败:", error);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 mx-0 p-4 space-y-6 w-full">
      {/* 主题模式 */}
      <div className="flex justify-between items-center mx-2">
        <Label className="w-16 text-base text-foreground/80">主题模式</Label>
        <div className="flex gap-2 ml-2">
          <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")} className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            浅色
          </Button>
          <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")} className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            深色
          </Button>
          <Button variant={theme === "system" ? "default" : "outline"} size="sm" onClick={() => setTheme("system")} className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            系统
          </Button>
        </div>
      </div>
      <div className="border-b border-border mb-2" />
      {/* 主题色 */}
      <div className="flex items-center justify-between mx-2  mb-2">
        <Label className="w-16 text-base text-foreground/80">主题颜色</Label>
        <div className="ml-2 w-auto">
          <Select value={colorScheme} onValueChange={handleColorSchemeChange}>
            <SelectTrigger id="color-scheme">
              <SelectValue placeholder="选择主题色" />
            </SelectTrigger>
            <SelectContent className="z-100">
              {colorSchemes.map((scheme) => {
                const colors = getThemeColors(scheme.value);
                return (
                  <SelectItem key={scheme.value} value={scheme.value}>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        {colors.map((c, i) => (
                          <span key={i} style={{ background: c, width: 18, height: 18, borderRadius: 6, display: "inline-block", border: "1px solid #eee" }} />
                        ))}
                      </span>
                      <span className="ml-1 text-base font-medium">{scheme.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
