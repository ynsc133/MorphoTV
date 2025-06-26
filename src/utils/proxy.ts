const getProxyBaseUrl = () => {
  const baseUrl = localStorage.getItem('PROXY_BASE_URL');
  if (!baseUrl) {
    throw new Error('代理地址未初始化');
  }
  return baseUrl;
};

export const createProxyUrl = (targetUrl: string): string => {
  const baseUrl = getProxyBaseUrl();
  return `${baseUrl}${encodeURIComponent(targetUrl)}`;
};

/**
   * 通过代理地址请求第三方接口
 */
export const fetchWithProxy = async (targetUrl: string, options?: RequestInit) => {
  const proxyUrl = createProxyUrl(targetUrl);
  return fetch(proxyUrl, options);
}; 