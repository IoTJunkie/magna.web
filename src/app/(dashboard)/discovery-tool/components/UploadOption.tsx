import { TypeCloudStorage } from '@/app/types/discovery';
import Image from 'next/image';
import DropboxChooser from 'react-dropbox-chooser';

interface UploadOptionProps {
  title: string;
  img_url: string;
  onclick?: (val?: TypeCloudStorage) => void;
  type?: TypeCloudStorage;
  handleFilesSelected?: (type: TypeCloudStorage, files: any) => void;
}

const UploadOption = ({
  title,
  img_url,
  onclick,
  type,
  handleFilesSelected,
}: UploadOptionProps) => {
  return type === TypeCloudStorage.DROP_BOX ? (
    <DropboxChooser
      appKey={process.env.NEXT_PUBLIC_DROPBOX_API_KEY || ''}
      success={(files: any) => {
        handleFilesSelected && handleFilesSelected(type, files);
      }}
      cancel={() => console.log('closed')}
      multiselect={true}
      linkType={['direct']}
    >
      <div className='flex w-full flex-row items-center gap-3 rounded-lg border-[0.0625rem] border-solid border-color-item-stroke px-6 py-4 hover:cursor-pointer sm:w-[9.5rem] sm:flex-col'>
        <Image src={img_url} alt={`${title} icon`} width={56} height={56} />
        <p className='text-md text-center font-[600] text-color-text-default'>{title}</p>
      </div>
    </DropboxChooser>
  ) : (
    <div
      className='flex w-full flex-row items-center gap-3 rounded-lg border-[0.0625rem] border-solid border-color-item-stroke px-6 py-4 hover:cursor-pointer sm:w-[9.5rem] sm:flex-col'
      onClick={() => {
        onclick && onclick(type);
      }}
    >
      <Image src={img_url} alt={`${title} icon`} width={56} height={56} />
      <p className='text-md text-center font-[600] text-color-text-default'>{title}</p>
    </div>
  );
};

export default UploadOption;
