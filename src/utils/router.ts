import { useNavigate } from 'react-router-dom';

/**
 * 路由跳转工具类
 */
export class RouterUtils {
  private static navigate: ReturnType<typeof useNavigate> | null = null;

  /**
   * 初始化路由工具
   * @param navigate useNavigate hook的返回值
   */
  static init(navigate: ReturnType<typeof useNavigate>) {
    RouterUtils.navigate = navigate;
  }

  /**
   * 通用路由跳转方法
   * @param path 目标路径
   * @param params URL参数对象
   */
  static navigateTo(path: string, params?: Record<string, string>) {
    if (!RouterUtils.navigate) {
      console.error('RouterUtils not initialized. Please call RouterUtils.init() first.');
      return;
    }

    // 构建查询字符串
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';

    // 执行跳转
    RouterUtils.navigate(`${path}${queryString}`);
    
    // 滚动到顶部
    window.scrollTo({ top: 0});
  }

  /**
   * 返回上一页
   */
  static goBack() {
    if (!RouterUtils.navigate) {
      console.error('RouterUtils not initialized. Please call RouterUtils.init() first.');
      return;
    }
    RouterUtils.navigate(-1);
    // 滚动到顶部
    window.scrollTo({ top: 0 });
  }

  /**
   * 刷新当前页面
   */
  static refresh() {
    if (!RouterUtils.navigate) {
      console.error('RouterUtils not initialized. Please call RouterUtils.init() first.');
      return;
    }
    RouterUtils.navigate(0);
    // 滚动到顶部
    window.scrollTo({ top: 0 });
  }
} 