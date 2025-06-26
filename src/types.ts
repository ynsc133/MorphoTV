export interface Movie {
  vod_id: string;
  vod_name: string;
  vod_pic: string;
  vod_play_url:string;
  vod_remarks?: string;
  vod_year?: string;
  vod_area?: string;
  type_name?: string;
  source?: string;
  sourceName?: string;
}

export interface ApiSite {
  key: string;
  name: string;
  api: string;
  enabled: boolean;
}

export interface SearchHistory {
  term: string;
  timestamp: number;
} 