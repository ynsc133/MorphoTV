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
  const [customTheme, setCustomTheme] = useState<string>(
    localStorage.getItem("morphotv-custom-theme") || ""
  );

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

  // 解析并应用自定义主题
  const applyCustomTheme = (css: string) => {
    // 解析 :root 和 .dark
    const rootMatch = css.match(/:root\s*{([^}]*)}/);
    const darkMatch = css.match(/\.dark\s*{([^}]*)}/);

    // 先清除旧的自定义变量（可选）
    // 这里只是简单实现，实际可维护一个变量列表来清理

    if (rootMatch) {
      rootMatch[1].split(";").forEach(line => {
        const [key, value] = line.split(":").map(s => s.trim());
        if (key && value) {
          document.documentElement.style.setProperty(key, value);
        }
      });
    }
    if (darkMatch && document.documentElement.classList.contains("dark")) {
      darkMatch[1].split(";").forEach(line => {
        const [key, value] = line.split(":").map(s => s.trim());
        if (key && value) {
          document.documentElement.style.setProperty(key, value);
        }
      });
    }
  };

  // 监听 customTheme 变化并应用
  useEffect(() => {
    if (customTheme) {
      applyCustomTheme(customTheme);
      localStorage.setItem("morphotv-custom-theme", customTheme);
    } else {
      localStorage.removeItem("morphotv-custom-theme");
      themeManager.onThemeModeChange();
    }
  }, [customTheme, colorScheme]);

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
      <div className="mt-6">
        <label className="block mb-2 font-medium">自定义主题 CSS</label>
        <textarea
          className="w-full h-40 p-2 border rounded"
          value={customTheme}
          onChange={e => setCustomTheme(e.target.value)}
          placeholder=":root { /* 粘贴你的主题变量 */ } &#10;.dark { /* 粘贴暗色变量 */ }"
        />
        <div className="text-xs text-muted-foreground mt-1">
          支持直接粘贴 CSS 变量，自动应用到当前主题，自定义主题CSS优先于选择的主题
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
