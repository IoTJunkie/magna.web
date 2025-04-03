'use client';
import BuyMoreResourceDialog from '@/app/_components/common/BuyMoreResourceDialog';
import CustomIcon from '@/app/_components/common/CustomIcon';
import UploadInput from '@/app/_components/common/UploadInput';
import { useProfileStore } from '@/app/_components/profile/profile-store';
import { fileTypeAllowUpload } from '@/app/constant';
import useToastComponent from '@/app/hooks/Toast';
import { isEnoughStorage } from '@/app/utils/checkResourceLeft';
import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const NewPolicyAnalyzer = () => {
  // const [showWarning, setShowWarning] = useState(false);
  const dropZoneRef = useRef<any>(null);
  const dropZoneBlurRef = useRef<any>(null);
  const router = useRouter();
  const { resourceInfo, documentSizeLimit } = useProfileStore();
  const [isDragging, setIsDragging] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [message, setMessage] = useState<string | undefined>('');
  const [showBuyMoreResourceDialog, setShowBuyMoreResourceDialog] = useState(false);
  const validFileTypes = fileTypeAllowUpload.join(', ');
  const [msgValidateFile, setMsgValidateFile] = useState('');
  const fileSelectedRef = useRef<File | null>(null);
  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: msgValidateFile,
  });

  useEffect(() => {
    const handleDragOver = (event: any) => {
      event.preventDefault();
      setIsDragging(true);
    };

    const dropZoneElement = dropZoneRef.current;
    if (dropZoneElement) {
      dropZoneElement.addEventListener('dragover', handleDragOver);
    }

    return () => {
      if (dropZoneElement) {
        dropZoneElement.removeEventListener('dragover', handleDragOver);
      }
    };
  }, []);

  const handleToastMsg = (msg: string) => {
    setIntent('error');
    setMsgValidateFile(msg);
    showToast();
  };

  useEffect(() => {
    const handleDragLeave = (e: any) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleErrValidateFile = (msg: string) => {
      handleToastMsg(msg);
      setIsDragging(false);
    };

    const handleDrop = (event: any) => {
      event.preventDefault();

      if (resourceInfo && !isEnoughStorage(resourceInfo).isEnough) {
        setMessage(isEnoughStorage(resourceInfo).message);
        setShowBuyMoreResourceDialog(true);
        setIsDragging(false);
        return;
      }

      const files = event.dataTransfer.files;
      if (files.length) {
        const file = files[0];
        fileSelectedRef.current = file;
        // Check file type
        const allowedFileTypes = validFileTypes.split(',').map((type) => type.trim());
        const fileType = `.${file.name.split('.').pop()}`;
        if (!allowedFileTypes.includes(fileType.toLocaleLowerCase())) {
          handleErrValidateFile(
            'Invalid File Format, please upload a PDF, DOC, DOCX or image file.',
          );
          return;
        }
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > documentSizeLimit) {
          handleErrValidateFile('The file size exceeds the limit. Please upload a smaller file.');
          return;
        }
        if (resourceInfo && !isEnoughStorage(resourceInfo, file.size).isEnough) {
          handleErrValidateFile(
            'You dont have enough storage for uploading selected file. Please upload a smaller file or exchange more storage.',
          );
          setShowBuyMoreResourceDialog(true);
          return;
        }

        setFileSelected(file);
      }
      setIsDragging(false);
    };

    const dropZoneElement = dropZoneBlurRef.current;
    if (dropZoneElement) {
      dropZoneElement.addEventListener('dragleave', handleDragLeave);
      dropZoneElement.addEventListener('drop', handleDrop);
    }
    return () => {
      if (dropZoneElement) {
        dropZoneElement.removeEventListener('dragleave', handleDragLeave);
        dropZoneElement.removeEventListener('drop', handleDrop);
      }
    };
  }, [isDragging]);

  const handleClearFileSelected = () => {
    setFileSelected(null);
  };

  // const handleClickOutside = (event: MouseEvent) => {
  //   if (uploadRef.current && !uploadRef.current.contains(event.target as Node)) {
  //     setShowWarning(true);
  //     // Handle the click outside event, for example, show an alert
  //     event.stopPropagation();
  //     event.preventDefault();
  //   }
  // };

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (!showWarning) document.addEventListener('click', handleClickOutside);
  //   }, 100);

  //   return () => {
  //     document.removeEventListener('click', handleClickOutside);
  //   };
  // }, [showWarning]);

  // const onCancel = () => {
  //   document.removeEventListener('click', handleClickOutside);
  //   setShowWarning(false);
  // };

  return (
    <div
      className='relative m-auto flex h-full flex-col items-center justify-start gap-6 px-5 pt-[3%] lg:px-0 '
      ref={dropZoneRef}
    >
      {isDragging && (
        <div
          className={classNames('absolute top-0 z-20 size-full', {
            'z-20 bg-bg-gray-blur': isDragging,
            'z-0 bg-white': !isDragging,
          })}
          ref={dropZoneBlurRef}
        ></div>
      )}
      <CustomIcon name='policy-analyzer' width={300} height={300} className='hidden lg:block' />
      <div className='mt-16  text-center font-heading text-[2rem] font-semibold capitalize leading-10 tracking-[0.03125rem] text-neutrual-900 md:mt-0 md:text-[2.75rem] lg:leading-tight xl:text-5xl 2xl:text-6xl'>
        Policy Pro
      </div>
      <div className='w-full text-center text-base text-support lg:w-1/2'>
        Upload any insurance policy, ask about coverages, exclusions, hypotheticals, or ask Magna to
        summarize the entire policy.
      </div>
      <UploadInput
        fileSelected={fileSelected}
        clearFileSelected={handleClearFileSelected}
        isEnoughStorage={isEnoughStorage}
      />
      {showBuyMoreResourceDialog && (
        <BuyMoreResourceDialog
          open={showBuyMoreResourceDialog}
          title={'Warning'}
          content={message}
          onConfirm={() => router.push('/settings/credit-insight')}
          onCancel={() => setShowBuyMoreResourceDialog(false)}
        />
      )}
      {/* {showWarning && (
        <DialogComponent
          open={showWarning}
          title='Document in processing!'
          content='Your patience is appreciated.'
          textCancel='Got it'
          onCancel={onCancel}
          onConfirm={undefined}
        />
      )} */}
      {toasterComponent}
    </div>
  );
};
export default NewPolicyAnalyzer;

NewPolicyAnalyzer.displayName = 'NewPolicyAnalyzer';
