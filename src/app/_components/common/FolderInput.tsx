import { validateFile } from '@/app/utils/validation';
import { useUploadDocsMagnaContext } from '@/contexts/UploadDocsMagnaContext';

type FolderInputProps = {
  onSelectFiles: (files: File[]) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  setErrorMessage: (newMessage: string) => void;
  onCancel: () => void;
  onShowErr?: (v: string, s?: boolean) => void;
};

const FolderInput: React.FC<FolderInputProps> = ({
  onSelectFiles,
  inputRef,
  setErrorMessage,
  onCancel,
  onShowErr,
}) => {
  const { onSetIsPreviewScreen, isPlusPlan, refFolAlreadyExists } = useUploadDocsMagnaContext();
  const handleFileChange = () => {
    setErrorMessage('');
    const files = Array.from(inputRef.current?.files || []);
    if (files.length !== 0) {
      const isNotValidate = files.every((file: File) => {
        const message = validateFile(file);
        if (message !== 'OK') {
          onCancel();
          // setErrorMessage(message);
          return true;
        }
        return false;
      });
      if (!isNotValidate) {
        onSelectFiles(files);
        onSetIsPreviewScreen(true);
      } else if (isPlusPlan && refFolAlreadyExists) {
        onShowErr &&
          onShowErr(
            'You can only upload one folder at a time. Please upgrade your plan to add more.',
          );
        onSetIsPreviewScreen(true);
      }
    }
  };

  return (
    <input
      type='file'
      ref={inputRef}
      multiple
      onChange={handleFileChange}
      className='hidden'
      // @ts-ignore
      directory=''
      // @ts-ignore
      webkitdirectory=''
    />
  );
};

export default FolderInput;
