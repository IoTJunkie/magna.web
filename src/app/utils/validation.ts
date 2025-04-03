import { fileTypeAllowUpload, mimeTypeAllowUpload } from '@/app/constant';
import { IFileBoxSelected, IFileDriveSelected } from '../types/discovery';
import { useProfileStore } from '../_components/profile/profile-store';

const validFileTypes = fileTypeAllowUpload.join(', ');
const msgInvalidFileFomat =
  'Invalid File Format, please upload a folder, PDF, DOC, DOCX, Excel or image file.';
const msgFileSizeExceeds = 'The file size exceeds the limit. Please upload a smaller file.';

export const validateFile = (file: File) => {
  const { documentSizeLimit } = useProfileStore.getState();
  // Check file type
  const allowedFileTypes = validFileTypes.split(',').map((type) => type.trim());
  const fileType = `.${file.name.split('.').pop()}`.toLowerCase();
  if (!allowedFileTypes.includes(fileType.toLocaleLowerCase())) {
    return msgInvalidFileFomat;
  }
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > documentSizeLimit) {
    return msgFileSizeExceeds;
  }
  return 'OK';
};

export const validateFileGgDrive = (file: IFileDriveSelected) => {
  const { documentSizeLimit } = useProfileStore.getState();
  // Check file type
  const allowedFileTypes = validFileTypes.split(',').map((type) => type.trim());
  const fileType = `.${file.name.split('.').pop()}`.toLowerCase();
  if (!allowedFileTypes.includes(fileType.toLocaleLowerCase())) {
    return msgInvalidFileFomat;
  }
  // Check file size
  const fileSizeMB = file.sizeBytes / (1024 * 1024);
  if (fileSizeMB > documentSizeLimit) {
    return msgFileSizeExceeds;
  }
  return 'OK';
};

export const validateMimeTypeGgDrive = (mimeType: string) => {
  // Check mimeType
  if (!mimeTypeAllowUpload.includes(mimeType)) {
    return msgInvalidFileFomat;
  }
  return 'OK';
};
export const validateSizeGgDrive = (sizeBytes: number) => {
  const { documentSizeLimit } = useProfileStore.getState();
  // Check file size
  const fileSizeMB = sizeBytes / (1024 * 1024);
  if (fileSizeMB > documentSizeLimit) {
    return msgFileSizeExceeds;
  }
  return 'OK';
};

export const validateSizeDropbox = (size: number, mimeType: string) => {
  const { documentSizeLimit } = useProfileStore.getState();
  // Check mimeType
  if (!mimeTypeAllowUpload.includes(mimeType)) {
    return msgInvalidFileFomat;
  }
  // Check size
  const fileSizeMB = size / (1024 * 1024);
  if (fileSizeMB > documentSizeLimit) {
    return msgFileSizeExceeds;
  }
  return 'OK';
};
export const validateFileBox = (file: IFileBoxSelected) => {
  const { documentSizeLimit } = useProfileStore.getState();
  // Check file type
  const allowedFileTypes = validFileTypes.split(',').map((type) => type.trim());
  const fileType = `.${file.name.split('.').pop()}`.toLowerCase();
  if (!allowedFileTypes.includes(fileType.toLocaleLowerCase())) {
    return msgInvalidFileFomat;
  }
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > documentSizeLimit) {
    return msgFileSizeExceeds;
  }
  return 'OK';
};

export const validateTypeFileMycase = (type: string) => {
  const allowedFileTypes = validFileTypes.split(',').map((type) => type.trim());
  const fileType = `.${type.split('.').pop()}`.toLowerCase();
  if (!allowedFileTypes.includes(fileType.toLocaleLowerCase())) {
    return false;
  }
  return true;
};

export const validateSizeFileMycase = (size: number) => {
  const { documentSizeLimit } = useProfileStore.getState();
  const fileSizeMB = size / (1024 * 1024);
  if (fileSizeMB > documentSizeLimit) {
    return false;
  }
  return true;
};
