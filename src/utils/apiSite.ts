import { API_SITES } from '@/config/apiSites';

export function getSelectedApiSites(): string[] {
  const saved = localStorage.getItem('selectedApiSites');
  if (saved) {
    return JSON.parse(saved);
  }
  // 默认只选中第一个
  return [API_SITES[0].key];
}

export function setSelectedApiSites(keys: string[]) {
  localStorage.setItem('selectedApiSites', JSON.stringify(keys));
} 