export interface DiscoveryItem {
  id: string;
  created: string;
  modified: string;
  deadline: string;
  created_by: number;
  title: string;
  extraction_status: boolean;
}

export enum ExtractionStatus {
  SUCCESS = 'Success',
  PROCESSING = 'Processing',
  ERROR = 'Error',
}

export interface ICaseDocumentUpload {
  id: string;
  name: string;
  upload: string;
  extracted: boolean;
  retriever_id: string | null;
  total_pages: number;
  path: string;
  url: string;
}

interface IStateInfo {
  country: string;
  id: number;
  name: string;
}

export interface ICaseDetail {
  id: string;
  title: string;
  created_by: number | string;
  documents: ICaseDocumentUpload[];
  interrogative_document_id: string | null;
  plaintiffName: string | null;
  defendantName: string | null;
  caseNumber: string | null;
  is_federal: boolean;
  state: IStateInfo | null;
  state_id: string | null;
}

export interface ICaseInfo {
  caseName: string | null;
  plaintiffName: string | null;
  defendantName: string | null;
  caseNumber: string | null;
  is_federal: boolean | null;
  state: number | null;
}

export interface IDiscoveryCaseDocsDetail {
  id: string;
  name: string;
  case: {
    id: string;
    title: string;
    created_by: number;
    documents: ICaseDocumentUpload[];
  };
  document_ids: string[];
}

export interface IItemTree {
  value: string;
  content: string;
  id: string;
  isFile: boolean;
  parentValue: string | undefined;
}

export enum TypeCloudStorage {
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  BOX = 'BOX',
  DROP_BOX = 'DROP_BOX',
  MY_CASE = 'MY_CASE',
}

export interface IFileDriveSelected {
  id: string;
  serviceId: string;
  mimeType: string;
  name: string;
  description: string;
  type: string;
  lastEditedUtc: number;
  iconUrl: string;
  url: string;
  embedUrl: string;
  sizeBytes: number;
  isShared: boolean;
}

export interface IFileDropboxSelected {
  id: string;
  name: string;
  bytes: number;
  isDir: boolean;
  link: string;
  linkType: string;
  icon: string;
}

interface IFileBoxSelectedParent {
  type: string;
  id: string;
  sequence_id: string;
  etag: string;
  name: string;
}

export interface IFileBoxSelected {
  type: string;
  id: string;
  name: string;
  size: number;
  extension: string;
  permissions: {
    can_download: boolean;
  };
  authenticated_download_url: string;
  shared_link: {
    url: string;
    download_url: string;
    permissions: {
      can_download: boolean;
    };
  };
  parent: IFileBoxSelectedParent;
  pathParent?: string;
}

export interface IResponseSelectedBox {
  currentFolderId: string;
  currentFolderName: string;
  selectedCount: number;
  selectedItems: IFileBoxSelected[];
  onChoose: (files: IFileBoxSelected[]) => void;
  onCancel: () => void;
}

export interface ICaseDetails {
  id: number;
  name: string;
  case_number: string;
  description: string;
  opened_date: string;
  closed_date: string;
  sol_date: string;
  practice_area: string;
  case_stage: string;
  status: string;
  outstanding_balance: number;
  contacts: null;
}
export interface ICaseDocDetails {
  id: number;
  name: string;
  filename: string;
  path: string;
  description: string;
  assigned_date: string;
  case: {
    id: number;
  };
  created_at: string;
  updated_at: string;
  self_url: string;
  folder: {
    id: number;
  };
}
