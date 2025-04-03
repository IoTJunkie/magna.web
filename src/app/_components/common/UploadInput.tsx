'use client';
import { fileTypeAllowUpload } from '@/app/constant';
import { useUploadForm } from '@/app/hooks/useUpload';
import { IResource, IResourceLeftChecking } from '@/app/types/creditInsight';
import { Button, Field, Input, ProgressBar } from '@fluentui/react-components';
import classNames from 'classnames';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProfileStore } from '../profile/profile-store';
import BuyMoreResourceDialog from './BuyMoreResourceDialog';
import { convertDocumentMaxFileSize } from '@/app/utils';
import { STORAGE_ITEM_NAME } from '@/config';

interface UploadInputProps {
  validFileTypes?: string; // Example: '.pdf, .doc, .docx'
  uploadUrl?: string;
  fileSelected?: File | null;
  clearFileSelected: () => void;
  isEnoughStorage: (resource: IResource, fileSize?: number) => IResourceLeftChecking;
}

const UploadInput: React.FC<UploadInputProps> = ({
  validFileTypes = fileTypeAllowUpload.join(', '),
  uploadUrl = '/api/policies/create/',
  fileSelected,
  clearFileSelected,
  isEnoughStorage,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState<string | undefined>('');
  const [validationState, setValidationState] = useState<boolean>(true);
  const [showBuyMoreResourceDialog, setShowBuyMoreResourceDialog] = useState(false);
  const router = useRouter();
  const { resourceInfo, documentSizeLimit } = useProfileStore();
  const { uploadForm, progress, isLoading, error, step, isSuccess } = useUploadForm(uploadUrl);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (progress !== 1 && selectedFile) {
        const message = 'Are you sure you want to leave? Your file upload is in progress.';
        event.returnValue = message; // Standard for most browsers
        return message; // For some older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [progress, selectedFile]);

  const handleUpload = async () => {
    // Check if a file is selected
    if (!selectedFile) {
      setErrorMessage('Please select a file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', name);
    try {
      await uploadForm(formData);
    } catch (error) {
      setErrorMessage(`${error}`);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      handleUpload();
    }
  }, [selectedFile]);

  useEffect(() => {
    isSuccess && router.push('/policy-analyzer');
  }, [isSuccess]);

  useEffect(() => {
    if (step === 'Extracting') {
      router.push('/policy-analyzer');
    }
  }, [step]);

  const validateFile = (file: File) => {
    // Check file type
    const allowedFileTypes = validFileTypes.split(',').map((type) => type.trim());
    const fileType = `.${file.name.split('.').pop()}`;
    if (!allowedFileTypes.includes(fileType.toLocaleLowerCase())) {
      setErrorMessage('Invalid File Format, please upload a PDF, DOC, DOCX or image file.');
      return;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > documentSizeLimit) {
      setErrorMessage('The file size exceeds the limit. Please upload a smaller file.');
      return;
    }
    if (resourceInfo && !isEnoughStorage(resourceInfo, file.size).isEnough) {
      setMessage(isEnoughStorage(resourceInfo, file.size).message);
      setShowBuyMoreResourceDialog(true);
    }
    return true;
  };

  useEffect(() => {
    if (fileSelected) {
      if (validateFile(fileSelected)) {
        // Set selected file
        setName(`${fileSelected.name}`);
        setSelectedFile(fileSelected);
        setErrorMessage(null);
        clearFileSelected();
      }
    }
  }, [fileSelected]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if (!name) {
    //   setErrorMessage('The Policy name is required.');
    //   setSelectedFile(null);
    //   setValidationState(false);
    //   event.target.value = '';
    //   return;
    // }

    const fileInput = event.target;
    const file = fileInput.files?.[0] ?? null;
    event.target.value = '';
    localStorage.setItem(STORAGE_ITEM_NAME.users_have_used_policy_pro, 'true');
    setValidationState(true);
    if (file && validateFile(file)) {
      if (!name) setName(`${file.name.slice(0, 255)}`);
      setErrorMessage(null);
      setSelectedFile(file);
    }
  };

  const checkStorageLeft = (e: React.MouseEvent<HTMLInputElement>) => {
    if (resourceInfo && !isEnoughStorage(resourceInfo).isEnough) {
      e.preventDefault();
      setMessage(isEnoughStorage(resourceInfo).message);
      setShowBuyMoreResourceDialog(true);
    }
  };

  const handleClickUploadFile = (e: React.MouseEvent<HTMLInputElement>) => {
    checkStorageLeft(e);
  };

  return (
    <>
      <div className='flex w-full flex-col gap-2 lg:w-1/2'>
        <Field
          label='Policy name'
          validationMessageIcon={null}
          className='w-full [&_label]:!font-semibold [&_label]:text-neutrual-900'
          validationState={
            !validationState || error === 'Policy with this name already exists.' ? 'error' : 'none'
          }
        >
          <Input
            placeholder='Policy name'
            size='large'
            className='mb-4 !text-sm'
            maxLength={255}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <div
          className={classNames(
            'relative flex h-fit w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-aero-11 p-8 text-base font-bold text-aero-13 hover:cursor-pointer',
          )}
        >
          <Image src='/svg/cloud-file.svg' alt='' width={29} height={23} />
          <div>Drag and Drop file</div>
          <div>OR</div>
          <label className='ms-Button ms-Button--primary' htmlFor='fileInput'>
            <Button className='btn-bg-none text-xs !text-aero-12 ' disabled={isLoading}>
              Upload file
            </Button>
          </label>
          <input
            type='file'
            id='fileInput'
            accept={validFileTypes}
            onClick={(e) => handleClickUploadFile(e)}
            onChange={handleFileUpload}
            className='absolute size-full opacity-0 hover:cursor-pointer'
            disabled={isLoading}
          />
          <span id='fileHint' className='text-center text-xs font-normal text-aero-13'>
            Accepts .pdf, .doc, .docx and image file type (Maximum file size{' '}
            {convertDocumentMaxFileSize(documentSizeLimit)})
          </span>
        </div>

        {(errorMessage || error) && (
          <div className='text-center text-xs text-red-1'>{errorMessage ?? error}</div>
        )}
        {showBuyMoreResourceDialog && (
          <BuyMoreResourceDialog
            open={showBuyMoreResourceDialog}
            title={'Warning'}
            content={message}
            onConfirm={() => router.push('/settings/credit-insight')}
            onCancel={() => setShowBuyMoreResourceDialog(false)}
          />
        )}
        {selectedFile && !errorMessage && !error && (
          <div className='mt-4 flex flex-row gap-2'>
            <div>
              <Image src='/svg/folder-icon.svg' alt='' width={32} height={32} />
            </div>
            <div className='flex w-full flex-col gap-2'>
              <div className='flex gap-2'>
                <span className='text-sm font-medium text-neutrual-900'>{selectedFile.name}</span>
                <span className='text-sm text-support'>
                  ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <Field validationMessage={step} validationState='none'>
                <ProgressBar value={progress} thickness='large' />
              </Field>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UploadInput;

UploadInput.displayName = 'UploadInput';
