import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Image as ImageFluent,
} from '@fluentui/react-components';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface DialogComponentProps {
  open?: boolean;
  onCancel?: () => void;
  handleUploadImage: () => void;
  setSelectedImage: (files: File | string) => void;
  selectedImage: File | string;
}

const ChangeProfilePictureDialog = ({
  onCancel,
  open: isOpen,
  handleUploadImage,
  selectedImage,
  setSelectedImage,
}: DialogComponentProps) => {
  const [open, setOpen] = useState(isOpen);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    setSelectedImage(file ?? '');
  };

  const handleSelectImage = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  const handleDeleteImage = () => {
    setSelectedImage('');
  };

  return (
    <Dialog open={open} modalType='alert'>
      <DialogSurface className='!h-[400px] !w-[367px]'>
        <DialogBody className='!flex h-full w-full !flex-col !justify-between'>
          <DialogTitle className='!text-lg !font-semibold'>Change Profile Picture</DialogTitle>
          <DialogContent className='text-center'>
            <div onClick={handleSelectImage}>
              {selectedImage ? (
                <div className='mx-auto h-[160px] w-[160px]'>
                  <ImageFluent
                    src={
                      typeof selectedImage === 'string'
                        ? selectedImage
                        : URL.createObjectURL(selectedImage)
                    }
                    width={160}
                    height={160}
                    fit='cover'
                    alt='Preview Image'
                  />
                </div>
              ) : (
                <div
                  className='mx-auto flex h-[160px] w-[160px] flex-col items-center justify-center gap-3 
                        rounded-[0.25rem] border-[1px] border-solid border-color-screen-stroke bg-[#DBDBDE] px-6 hover:cursor-pointer'
                >
                  <Image src={'/svg/add-more.svg'} alt={'Add more icon'} width={20} height={20} />
                  <div className='text-center text-[14px] text-sm font-[500]'>
                    <p>Add profile picture</p>
                  </div>
                </div>
              )}
            </div>
            <input
              type='file'
              ref={inputRef}
              accept='image/*'
              onChange={handleImageChange}
              className='hidden'
            />
          </DialogContent>
          <DialogActions className='mx-auto text-center'>
            <DialogTrigger disableButtonEnhancement>
              <Button
                className='!border-aero-10 !text-base !font-semibold'
                size='large'
                onClick={onCancel}
              >
                Cancel
              </Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button
                className='w-auto !text-base !font-semibold !text-confirm'
                appearance='primary'
                onClick={handleUploadImage}
              >
                Upload
              </Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button
                className='w-auto !bg-danger !text-base !font-semibold !text-confirm'
                onClick={handleDeleteImage}
              >
                Delete
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ChangeProfilePictureDialog;

ChangeProfilePictureDialog.displayName = 'ChangeProfilePictureDialog';
