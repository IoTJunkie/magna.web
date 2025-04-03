'use client';
import CustomIcon from '@/app/_components/common/CustomIcon';
import { useProfileStore } from '@/app/_components/profile/profile-store';
import { useUploadDiscovery } from '@/app/hooks/useUploadDiscovery';
import { IResource, IResourceLeftChecking } from '@/app/types/creditInsight';
import { validateFile } from '@/app/utils/validation';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button, Field, Input, ProgressBar } from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import classNames from 'classnames';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PreviewUpload from './PreviewUpload';
import UploadDialog from './UploadDialog';
import { TimeFormat } from '@/config';
import MyCaseDialog from '@/app/_components/common/MyCase/MyCaseDialog';
import { convertDocumentMaxFileSize } from '@/app/utils';

interface UploadInputProps {
  validFileTypes?: string; // Example: '.pdf, .doc, .docx'
  uploadUrl?: string;
  fileSelected: any[];
  clearFileSelected: () => void;
  onSelectFiles: (files: any) => void;
  isOpenUploadDialog: boolean;
  setIsOpenUploadDialog: (isOpenUploadDialog: boolean) => void;
  setFileSelected: React.Dispatch<React.SetStateAction<any[]>>;
  isEnoughStorage: (resource: IResource, totalSize?: number) => IResourceLeftChecking;
  blockUpload: (resourceType: string, type: 'empty' | 'close') => void;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
}

export interface PreviewFile {
  name: string;
  id: string;
}

const UploadMultiCase: React.FC<UploadInputProps> = ({
  uploadUrl = `${process.env.NEXT_PUBLIC_ENDPOINT_MEDIA}/discovery_text_extraction `,
  fileSelected,
  onSelectFiles,
  isOpenUploadDialog,
  setIsOpenUploadDialog,
  setFileSelected,
  isEnoughStorage,
  blockUpload,
  errorMessage,
  setErrorMessage,
}) => {
  // const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUploadFile, setPreviewUploadFile] = useState<PreviewFile[]>([]);
  const [name, setName] = useState<string>('');
  const [deadline, setDeadline] = useState<Date | null | undefined>(null);
  const [openMyCase, setOpenMyCase] = useState(false);
  const { resourceInfo, documentSizeLimit } = useProfileStore();
  const { theme } = useThemeContext();
  const router = useRouter();

  const { uploadForm, progress, isLoading, error, step, isSuccess } = useUploadDiscovery(uploadUrl);

  // useEffect(() => {
  //     const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //     if (progress !== 1 && selectedFile) {
  //         const message = 'Are you sure you want to leave? Your file upload is in progress.';
  //         event.returnValue = message; // Standard for most browsers
  //         return message; // For some older browsers
  //     }
  // };

  //     window.addEventListener('beforeunload', handleBeforeUnload);

  //     return () => {
  //       window.removeEventListener('beforeunload', handleBeforeUnload);
  //     };
  //   }, [progress, selectedFile]);

  const upload = async () => {
    const formData = new FormData();

    for (const file of fileSelected) {
      const message = validateFile(file);
      if (message === 'OK') {
        if (file?.blob) {
          formData.append('files', file.blob, file.name);
        } else {
          formData.append('files', file);
        }
        formData.append(
          'paths',
          file.webkitRelativePath ? file.webkitRelativePath : file.path ? file.path : file.name,
        );
      }
    }
    formData.append('title', name);
    if (deadline) {
      formData.append('deadline', dayjs(deadline).format('YYYY-MM-DD'));
    }
    try {
      const res = await uploadForm(formData);
      console.log(res);
    } catch (error) {
      console.log('error discovery tool upload: ', error);
      setErrorMessage(`${error}`);
    }
  };

  const handleUpload = async () => {
    upload();
  };
  //   useEffect(() => {
  //     if (selectedFile) {
  //       handleUpload();
  //     }
  //   }, [selectedFile]);

  useEffect(() => {
    isSuccess && router.push('/discovery-tool');
  }, [isSuccess]);

  useEffect(() => {
    if (step === 'Uploaded') {
      router.push('/discovery-tool');
    }
  }, [step]);

  useEffect(() => {
    if (fileSelected && fileSelected.length > 0) {
      const newPreviewFile: PreviewFile[] = [];
      fileSelected.map((file: any) => {
        const { webkitRelativePath, name, path, id } = file;
        if (webkitRelativePath === '' && !path) {
          newPreviewFile.push({ name, id });
        } else {
          const folderName =
            webkitRelativePath !== ''
              ? webkitRelativePath.substr(0, webkitRelativePath.indexOf('/'))
              : path.substr(0, path.indexOf('/'));
          if (
            !newPreviewFile.some(
              (filePreview) => filePreview.name === folderName && id === filePreview.id,
            )
          ) {
            newPreviewFile.push({ id, name: folderName });
          }
        }
      });
      setPreviewUploadFile(newPreviewFile);
    }
  }, [fileSelected]);

  const removeUploadFile = (id: string) => {
    const removeFile = previewUploadFile.find((item) => item.id === id);
    setPreviewUploadFile((prevState) => prevState.filter((item) => item.id !== id));
    if (removeFile?.name.includes('.')) {
      const updateFileSelected = fileSelected.filter(
        (file: any) => file.name !== removeFile.name && file.id !== id,
      );
      setFileSelected(updateFileSelected);
    } else {
      const updateFileSelected = fileSelected.filter(
        (file: any) => !file.webkitRelativePath.includes(removeFile?.name) && file.id !== id,
      );
      setFileSelected(updateFileSelected);
    }
  };

  const onFormatDate = (date?: Date): string => {
    return !date ? '' : dayjs(date).format(TimeFormat.mdy);
  };

  const handleChangeDeadline = () => {};

  //   useEffect(() => {
  //     if (fileSelected) {
  //       if (validateFile(fileSelected)) {
  //         // Set selected file
  //         setName(`${fileSelected.name}`);
  //         setSelectedFile(fileSelected);
  //         setErrorMessage(null);
  //         clearFileSelected();
  //       }
  //     }
  //   }, [fileSelected]);

  const handleOpenUploadDialog = () => {
    if (resourceInfo && !isEnoughStorage(resourceInfo).isEnough) {
      blockUpload('Storage', 'empty');
      return;
    }

    setIsOpenUploadDialog(true);
  };

  const sizeOfFiles = () => {
    let totalSize = 0;
    fileSelected.forEach((file) => {
      totalSize += file.size;
    });
    return (totalSize / (1024 * 1024)).toFixed(2);
  };

  return (
    <>
      <div className='flex w-full flex-col gap-2 lg:w-1/2'>
        <Field
          label='Case name'
          required
          validationMessageIcon={null}
          className='w-full [&_label]:!font-semibold [&_label]:text-neutrual-900'
        >
          <Input
            placeholder='Case name'
            size='large'
            className='mb-4 !text-sm'
            maxLength={255}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field
          label='Deadline'
          size='large'
          validationMessageIcon={null}
          className='w-full [&_label]:!font-semibold [&_label]:text-neutrual-900'
        >
          <DatePicker
            className='z-40 mb-4 !text-sm'
            showMonthPickerAsOverlay
            highlightSelectedMonth
            size='large'
            showGoToToday={true}
            formatDate={onFormatDate}
            value={deadline}
            onChange={handleChangeDeadline}
            onSelectDate={setDeadline as (date?: Date | null) => void}
            contentAfter={<CustomIcon name='calendar' />}
            placeholder='Pick a date'
          />
        </Field>
        {previewUploadFile && previewUploadFile?.length > 0 ? (
          <PreviewUpload
            files={previewUploadFile}
            handleUpload={handleUpload}
            isLoading={isLoading}
            removeUploadFile={removeUploadFile}
            setIsOpenUploadDialog={setIsOpenUploadDialog}
            name={name}
            theme={theme}
          />
        ) : (
          <div
            className={classNames(
              'relative flex h-fit w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-aero-11 p-8 text-base font-bold text-aero-13 hover:cursor-pointer',
            )}
          >
            <Image src='/svg/cloud-file.svg' alt='' width={29} height={23} />
            <label className='ms-Button ms-Button--primary' htmlFor='fileInput'>
              <Button
                className='btn-bg-none text-xs !text-aero-12'
                onClick={handleOpenUploadDialog}
                disabled={isLoading}
              >
                Select
              </Button>
            </label>
            <span id='fileHint' className='text-center text-xs font-normal text-aero-13'>
              Accepts folder, .pdf, .doc, .docx and image file type (Maximum file size{' '}
              {convertDocumentMaxFileSize(documentSizeLimit)})
            </span>
          </div>
        )}

        {(errorMessage || error) && (
          <div className='text-center text-xs text-red-1'>
            {errorMessage ? errorMessage : error}
          </div>
        )}

        {isLoading && !errorMessage && !error && (
          <div className='mb-4 mt-4 flex flex-row gap-2'>
            <div>
              <Image src='/svg/folder-icon.svg' alt='' width={32} height={32} />
            </div>
            <div className='flex w-full flex-col gap-2'>
              <div className='flex gap-2'>
                <span className='text-sm font-medium text-neutrual-900'>
                  {fileSelected.length} {fileSelected.length > 1 ? 'items' : 'item'}
                </span>
                <span className='text-sm text-support'>({sizeOfFiles()} MB)</span>
              </div>
              <Field validationMessage={step} validationState='none'>
                <ProgressBar value={progress} thickness='large' />
              </Field>
            </div>
          </div>
        )}
      </div>
      {isOpenUploadDialog && (
        <UploadDialog
          open={isOpenUploadDialog}
          textCancel='Cancel'
          onCancel={() => setIsOpenUploadDialog(false)}
          onSelectFiles={onSelectFiles}
          setErrorMessage={setErrorMessage}
          setOpenMyCase={setOpenMyCase}
        />
      )}
      {openMyCase ? (
        <MyCaseDialog
          open={openMyCase}
          setOpen={setOpenMyCase}
          setFileSelected={setFileSelected}
          setShowDialogUploadDocs={setIsOpenUploadDialog}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default UploadMultiCase;

UploadMultiCase.displayName = 'UploadInput';
