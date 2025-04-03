import { IMycaseFileInfo } from '@/config';
import { PreviewFile } from '../(dashboard)/discovery-tool/components/UploadMultiCase';
import { ITreeItem } from '../types/documentsUpload';
import { FileDoc } from '../types/fileDoc';

export const getFileType = (fileName: string) => {
  if (fileName.endsWith('.pdf')) {
    return 'pdf';
  } else if (
    fileName.endsWith('.doc') || 
    fileName.endsWith('.docx') || 
    fileName.endsWith('.odt') || 
    fileName.endsWith('.txt') || 
    fileName.endsWith('.md')
  ) {
    return 'doc';
  } else if (
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.gif')
  ) {
    return 'upload';
  } else if (
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsm') ||
    fileName.endsWith('.xlsx')
  ) {
    return 'excel';
  } else {
    return 'folder';
  }
};

export const handleUpdateArray = (item: string, arr: string[]) => {
  const isItemExisted = arr.find((v) => v === item);
  const newArr = isItemExisted ? arr.filter((v) => v !== item) : [...arr, item];
  return newArr;
};

export const generateId = () => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const checkDocsHasFolder = (files: PreviewFile[]): boolean => {
  const allowedExtensions = [
    '.jpeg',
    '.png',
    '.jpg',
    '.pdf',
    '.doc',
    '.docx',
    '.odt',
    '.txt',
    '.md',
    '.xls',
    '.xlsm',
    '.xlsx',
    '.gif',
  ];
  return files.some((item) => {
    const fileName = item.name.toLocaleLowerCase();
    return !allowedExtensions.some((ext) => fileName.endsWith(ext));
  });
};

export const generateDocumentTree = (data: FileDoc[]): ITreeItem[] => {
  const result: ITreeItem[] = [];

  const processPath = (path: string, id: string, url: string, parentValue?: string) => {
    const pathParts = path.split('/');
    let value = '';

    for (let i = 0; i < pathParts.length; i++) {
      const content = pathParts[i];
      value = parentValue ? `${parentValue}-${content}` : content;
      result.push({
        value,
        parentValue,
        content,
        id,
        isFile: pathParts.length - 1 === i,
        url: url,
      });

      parentValue = value;
    }
  };
  for (const item of data) {
    processPath(item?.path || '', item?.id || '', item.url || '', item.parentValue);
  }

  return result;
};

export const filterFilesAllowedMyCase = (files: IMycaseFileInfo[]) => {
  if (files.length) {
    const typeAllowed = [
      '.jpeg',
      '.png',
      '.jpg',
      '.gif',
      '.pdf',
      '.doc',
      '.docx',
      'xls',
      'xlsm',
      'xlsx',
    ];
    const filesAllowed = files.filter((file) => {
      return typeAllowed.some((type) => file.filename.toLowerCase().endsWith(type));
    });
    return filesAllowed;
  }
  return [];
};

export const convertDocumentSizeLimit = (bytes: number) => {
  return bytes / 1000000;
};

// MB or GB
export const convertDocumentMaxFileSize = (mb: number) => {
  if (mb >= 1000) return `${mb / 1000} GB`;
  return `${mb} MB`;
};

export const escapedId = (id: string | undefined) => {
  if (!id) return '';
  return `id-${id.replace(/([\.\#\:\[\]\(\)])/g, '\\$1')}`;
};
