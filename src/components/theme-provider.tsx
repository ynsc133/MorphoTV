import { createContext, useContext, useEffect, useState } from "react"
import { themeManager } from "@/utils/theme-manager"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      // 通知主题管理器主题模式已变化
      themeManager.onThemeModeChange();
      return
    }
    root.classList.add(theme)
    // 通知主题管理器主题模式已变化
    themeManager.onThemeModeChange();
  }, [theme])

  // 应用保存的颜色方案
  useEffect(() => {
    const savedColorScheme = localStorage.getItem("morphotv-color-scheme");
    if (savedColorScheme) {
      const root = document.documentElement;
      
      // 移除所有可能的主题色类
      const colorSchemes = [
        "amethyst-haze"
      ];
      
      colorSchemes.forEach(scheme => {
        root.classList.remove(`theme-${scheme}`);
      });
      
      // 添加保存的颜色方案
      root.classList.add(`theme-${savedColorScheme}`);
    }
  }, []);

  // 初始化主题管理器
  useEffect(() => {
    themeManager.initTheme();
  }, []);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {

  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
