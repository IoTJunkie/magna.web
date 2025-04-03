import FileInput from '@/app/_components/common/FileInput';
import FolderInput from '@/app/_components/common/FolderInput';
import { useUploadDocsMagnaContext } from '@/contexts/UploadDocsMagnaContext';
import { MenuItem, MenuList } from '@fluentui/react-components';
import { DocumentArrowUpRegular, FolderArrowUpRegular } from '@fluentui/react-icons';
import { useRef } from 'react';

interface PopsOverMenuProps {
  onSelectFiles: (files: File[]) => void;
  setErrorMessage: (newMessage: string) => void;
  onCancel: () => void;
  fileSelected?: File | null;
  isMagna?: boolean;
  onShowErr?: (v: string, s?: boolean) => void;
}

const PopOverMenu = ({
  onSelectFiles,
  setErrorMessage,
  onCancel,
  isMagna = false,
  onShowErr,
}: PopsOverMenuProps) => {
  const { isPlusPlan, refFolAlreadyExists, onSetIsPreviewScreen } = useUploadDocsMagnaContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputFolderRef = useRef<HTMLInputElement>(null);

  const handleFileInputSelect = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFolderInputSelect = () => {
    if (inputFolderRef.current) {
      inputFolderRef.current.click();
    }
  };

  const hasDoubleSlash = (str: string): boolean => {
    return /\/.*\//.test(str);
  };

  const onSelectFolder = (files: File[]) => {
    if (isPlusPlan && refFolAlreadyExists) {
      onSetIsPreviewScreen(true);
      onShowErr &&
        onShowErr(
          'You can only upload one folder at a time. Please upgrade your plan to add more.',
        );
      return;
    }
    if (isMagna && isPlusPlan) {
      const newFiles = files.filter((item) => !hasDoubleSlash(item.webkitRelativePath));
      onSelectFiles(newFiles);
    } else {
      onSelectFiles(files);
    }
  };

  return (
    <MenuList>
      <MenuItem onClick={handleFileInputSelect} icon={<DocumentArrowUpRegular />}>
        <FileInput
          onSelectFiles={onSelectFiles}
          inputRef={inputRef}
          setErrorMessage={setErrorMessage}
          onCancel={onCancel}
        />
        File Upload
      </MenuItem>
      <MenuItem onClick={handleFolderInputSelect} icon={<FolderArrowUpRegular />}>
        <FolderInput
          onSelectFiles={(v: File[]) => {
            onSelectFolder(v);
          }}
          inputRef={inputFolderRef}
          setErrorMessage={setErrorMessage}
          onCancel={onCancel}
          onShowErr={onShowErr}
        />
        Folder Upload
      </MenuItem>
    </MenuList>
  );
};

export default PopOverMenu;
