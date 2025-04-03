export interface ITreeItem {
  value: string;
  parentValue?: string;
  content: string;
  id: string;
  isFile: boolean;
  url: string;
}

export interface IDocumentItem {
  id: string;
  name: string;
  upload: string;
  extracted: boolean;
  total_pages: number;
  path: string;
  url: string;
  parentValue?: string;
}
