import Image from 'next/image';
import { useEffect, useState } from 'react';

interface UploadOptionProps {
  fileName: string;
  removeUploadFile: () => void;
}

const FileContainer = ({ fileName, removeUploadFile }: UploadOptionProps) => {
  const [iconType, setIconType] = useState<string>('');
  const [isHover, setIsHover] = useState<boolean>(false);

  useEffect(() => {
    const fileNameGetIcon = fileName.toLowerCase();
    if (fileNameGetIcon.endsWith('.pdf')) {
      setIconType('pdf');
    } else if (
      fileNameGetIcon.endsWith('.doc') || 
      fileNameGetIcon.endsWith('.docx') || 
      fileNameGetIcon.endsWith('.md') || 
      fileNameGetIcon.endsWith('.odt') || 
      fileNameGetIcon.endsWith('.txt')
    ) {
      setIconType('doc');
    } else if (
      fileNameGetIcon.endsWith('.jpeg') ||
      fileNameGetIcon.endsWith('.png') ||
      fileNameGetIcon.endsWith('.jpg') ||
      fileNameGetIcon.endsWith('.gif')
    ) {
      setIconType('upload');
    } else if (
      fileNameGetIcon.endsWith('.xls') ||
      fileNameGetIcon.endsWith('.xlsm') ||
      fileNameGetIcon.endsWith('.xlsx')
    ) {
      setIconType('excel');
    } else {
      setIconType('folder');
    }
  }, [fileName]);

  return (
    <div
      onMouseOver={() => setIsHover(true)}
      onMouseOut={() => setIsHover(false)}
      onClick={removeUploadFile}
      className='relative mr-2 flex h-[9.375rem] flex-col items-center gap-3 rounded-lg border-[0.0625rem] border-solid border-color-screen-stroke px-6 pt-4 hover:cursor-pointer'
    >
      <Image
        src={`/svg/${iconType}-icon.svg`}
        alt={`${iconType} icon`}
        width={iconType === 'folder' ? 75 : 50}
        height={iconType === 'folder' ? 75 : 50}
      />
      {isHover && (
        <div className='absolute left-0 top-0 size-full rounded-lg bg-black/25'>
          <Image
            className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]'
            src={'/svg/bin-red.svg'}
            alt='delete-icon'
            width={51}
            height={51}
          />
        </div>
      )}
      <div className='w-full overflow-hidden text-ellipsis text-center text-sm font-[400] text-color-text-default'>
        <p className='line-clamp-2'>{fileName}</p>
      </div>
    </div>
  );
};

export default FileContainer;
