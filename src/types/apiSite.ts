export interface ApiSite {
  key: string;
  name: string;
  api: string;
  detail?: string;
  filterAdRule?: string;
  isCustom?: boolean;
}

export interface CustomApiSite {
  key: string;
  name: string;
  api: string;
  isCustom: true;
} 