export interface PolicyDocument {
  pk: number;
  name: string;
  upload: string;
  uploaded_by: number;
  extracted: boolean;
  content: {
    total_pages: number;
    page_contents: any[];
  };
}

export interface PolicyItem {
  id: string;
  created: string;
  modified: string;
  created_by: number;
  name: string;
  extraction_status: boolean;
  documents: PolicyDocument[];
  summary?: any;
}

export enum ExtractionStatus {
  SUCCESS = 'Success',
  PROCESSING = 'Processing',
  ERROR = 'Error',
}

export enum ExtractionStatusShowUi {
  SUCCESS = 'Report generated',
  PROCESSING = 'Processing file',
  ERROR = 'Upload failed',
  FILE_PROCESSSED = 'File processed',
}
