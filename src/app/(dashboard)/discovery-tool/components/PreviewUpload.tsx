import useToastComponent from '@/app/hooks/Toast';
import { checkDocsHasFolder } from '@/app/utils';
import { ThemeTypes } from '@/app/utils/multipleThemes';
import { Button, Image } from '@fluentui/react-components';
import { useEffect, useState } from 'react';
import FileContainer from './FileContainer';
import { PreviewFile } from './UploadMultiCase';

interface PreviewUploadProps {
  files: PreviewFile[];
  handleUpload: () => void;
  isLoading: boolean;
  removeUploadFile: (id: string) => void;
  name: string;
  theme: string;
  setIsOpenUploadDialog: (isOpenUploadDialog: boolean) => void;
}
const PreviewUpload = ({
  files,
  handleUpload,
  isLoading,
  removeUploadFile,
  name,
  theme,
  setIsOpenUploadDialog,
}: PreviewUploadProps) => {
  const [firstTimeShowToast, setFirstTimeShowToast] = useState(true);
  const { showToast, toasterComponent } = useToastComponent({
    content:
      'I noticed you uploaded a folder. Please ensure folders contain only PDFs, Docs, Docx, Excel and images for successful uploads!',
    intent: 'warning',
    timeoutProps: 5000,
  });

  useEffect(() => {
    const isHasFolder = checkDocsHasFolder(files);
    if (firstTimeShowToast && isHasFolder) {
      showToast();
      setFirstTimeShowToast(false);
    }
  }, [files, firstTimeShowToast, showToast]);

  return (
    <div className='relative'>
      {isLoading && <div className='absolute top-0 z-40 size-full rounded-lg'></div>}
      <div
        className={`${isLoading ? 'opacity-50' : ''} mb-4 rounded-lg border border-dashed border-aero-11 p-4 text-center text-base font-bold text-aero-13 hover:cursor-pointer`}
      >
        <div className='mb-4 grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4'>
          {files?.map((file) => (
            <FileContainer
              removeUploadFile={() => removeUploadFile(file.id)}
              key={file.id}
              fileName={file.name}
            />
          ))}
          <div
            className='py- relative mr-2 flex h-[9.375rem] flex-col items-center justify-center gap-3 rounded-lg 
              border-[0.0625rem] border-solid border-color-screen-stroke px-6 hover:cursor-pointer'
            onClick={() => setIsOpenUploadDialog(true)}
          >
            <Image
              src={`/svg/add-more${theme === ThemeTypes.DARK ? '-dark' : ''}.svg`}
              alt={'Add more icon'}
              width={30}
              height={30}
            />
            <div className='text-center text-sm font-[400] text-color-text-default'>
              <p>Add More</p>
            </div>
          </div>
        </div>
        <label className='ms-Button ms-Button--primary' htmlFor='fileInput'>
          <Button
            className={name ? 'btn-bg-none text-xs !text-aero-12' : ''}
            onClick={handleUpload}
            disabled={isLoading || !name}
          >
            Upload files
          </Button>
        </label>
      </div>
      {toasterComponent}
    </div>
  );
};

export default PreviewUpload;
