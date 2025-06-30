// 主题管理器
// 自动导入所有主题
const themeModules = import.meta.glob('../themes/*.ts', { eager: true });

// 生成主题映射和类型
const themeMap: Record<string, { label: string; light: Record<string, string>; dark: Record<string, string> }> = {};
Object.entries(themeModules).forEach(([path, mod]) => {
  const name = path.match(/([^/\\]+)\.ts$/)?.[1];
  const theme = (mod as { default: { label: string; light: Record<string, string>; dark: Record<string, string> } }).default;
  if (name && theme) {
    themeMap[name] = theme;
  }
});

export type ThemeName = keyof typeof themeMap;

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeName = Object.keys(themeMap)[0] as ThemeName;
  public themes = themeMap;

  private constructor() {
    const savedTheme = localStorage.getItem('morphotv-color-scheme');
    if (savedTheme && this.themes[savedTheme as ThemeName]) {
      this.currentTheme = savedTheme as ThemeName;
    }
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  public getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }

  public switchTheme(themeName: ThemeName): void {
    if (this.currentTheme === themeName || !this.themes[themeName]) {
      return;
    }
    try {
      this.applyTheme(themeName);
      this.currentTheme = themeName;
      localStorage.setItem('morphotv-color-scheme', themeName);
      console.log(`主题已切换到: ${themeName}`);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`切换主题失败: ${err.message}`);
      throw err;
    }
  }

  private applyTheme(themeName: ThemeName): void {
    const root = document.documentElement;
    const theme = this.themes[themeName];
    if (!theme) {
      throw new Error(`主题 ${themeName} 不存在`);
    }
    const isDark = root.classList.contains('dark');
    const themeVars = isDark ? theme.dark : theme.light;
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  public initTheme(): void {
    try {
      this.applyTheme(this.currentTheme);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`初始化主题失败: ${err.message}`);
      this.currentTheme = Object.keys(themeMap)[0] as ThemeName;
    }
  }

  public onThemeModeChange(): void {
    this.applyTheme(this.currentTheme);
  }
}

export const themeManager = ThemeManager.getInstance(); 