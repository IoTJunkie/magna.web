import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';

interface IFileBoxProps {
  fileName: string;
  onClick?: () => void;
  isActive: boolean;
  isDocExpand: boolean;
  isOnlyOneDoc: boolean;
}

const FileBox = ({
  fileName,
  onClick,
  isActive = false,
  isDocExpand = false,
  isOnlyOneDoc = false,
}: IFileBoxProps) => {
  const [iconType, setIconType] = useState<string>('');

  useEffect(() => {
    if (fileName.toLowerCase().endsWith('.pdf')) {
      setIconType('pdf');
    } else if (
      fileName.toLowerCase().endsWith('.doc') ||
      fileName.toLowerCase().endsWith('.docx') ||
      fileName.toLowerCase().endsWith('.odt') ||
      fileName.toLowerCase().endsWith('.txt') ||
      fileName.toLowerCase().endsWith('.md')
    ) {
      setIconType('doc');
    } else if (
      fileName.toLowerCase().endsWith('.jpeg') ||
      fileName.toLowerCase().endsWith('.png') ||
      fileName.toLowerCase().endsWith('.jpg') ||
      fileName.toLowerCase().endsWith('.gif')
    ) {
      setIconType('upload');
    } else if (
      fileName.toLowerCase().endsWith('.xls') ||
      fileName.toLowerCase().endsWith('.xlsm') ||
      fileName.toLowerCase().endsWith('.xlsx')
    ) {
      setIconType('excel');
    }
  });

  return (
    <div
      className={classNames(
        'mt-[0.5rem] flex max-h-[2.5rem] w-full cursor-pointer items-center gap-2.5 rounded-[0.75rem] px-4 py-2.5',
        {
          'bg-white': isActive,
          'bg-[#DBDBDE]': !isActive,
          '!w-[49.6%]': isDocExpand && !isOnlyOneDoc,
        },
      )}
      onClick={onClick}
    >
      <Image src={`/svg/${iconType}-icon.svg`} alt={`${iconType} icon`} width={14} height={18} />
      <h3 className='font-inter truncate text-sm font-semibold leading-[1.42857] text-[#0B0B0C]'>
        {fileName}
      </h3>
    </div>
  );
};

export default FileBox;
