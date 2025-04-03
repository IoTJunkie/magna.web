export interface Paginated<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T;
  modified?: string | null;
}

export interface ChatHistoryItem {
  id: string;
  created: string;
  modified: string;
  name: string;
  policy: string;
  policy_name: string;
  user: number;
}

//Mycase
export interface IMycaseTreeItem {
  id: number;
  name: string;
  path: string;
  isFile: boolean;
  fileName: string;
  children?: IMycaseTreeItem[];
}

export interface IMycaseFileInfo {
  assigned_date: string;
  created_at: string;
  description: string;
  filename: string;
  id: number;
  name: string;
  path: string;
  self_url: string;
  updated_at: string;
}
