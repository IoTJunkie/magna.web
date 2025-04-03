import { validateFile } from '@/app/utils/validation';
import { fileTypeAllowUpload } from '@/app/constant';

type FileInputProps = {
  onSelectFiles: (files: File[]) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  setErrorMessage: (newMessage: string) => void;
  onCancel: () => void;
  allowMultiple?: boolean;
};

const FileInput: React.FC<FileInputProps> = ({
  onSelectFiles,
  inputRef,
  setErrorMessage,
  onCancel,
  allowMultiple,
}) => {
  // const inputRef = useRef<HTMLInputElement>(null);
  const validFileTypes = fileTypeAllowUpload.join(', ');
  const handleFileChange = () => {
    const files = Array.from(inputRef.current?.files || []);
    const isNotValidate = files.some((file: File) => {
      const message = validateFile(file);
      if (message !== 'OK') {
        onCancel();
        setErrorMessage(message);
        return true;
      }
      return false;
    });
    if (!isNotValidate) {
      setErrorMessage('');
      onSelectFiles(files);
    }
  };

  return (
    <input
      type='file'
      accept={validFileTypes}
      ref={inputRef}
      multiple={allowMultiple ? true : false}
      onChange={handleFileChange}
      className='hidden'
    />
  );
};

export default FileInput;
