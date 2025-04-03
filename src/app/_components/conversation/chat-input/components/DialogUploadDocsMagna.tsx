import FileContainer from '@/app/(dashboard)/discovery-tool/components/FileContainer';
import PopsOverDevice from '@/app/(dashboard)/discovery-tool/components/PopsOverDevice';
import { PreviewFile } from '@/app/(dashboard)/discovery-tool/components/UploadMultiCase';
import UploadOption from '@/app/(dashboard)/discovery-tool/components/UploadOption';
import ConfirmDialog from '@/app/_components/common/ConfirmDialog';
import CustomIcon from '@/app/_components/common/CustomIcon';
import { IFileDriveSelected, IFileDropboxSelected, TypeCloudStorage } from '@/app/types/discovery';
import { checkDocsHasFolder, generateId } from '@/app/utils';
import {
  validateFile,
  validateFileGgDrive,
  validateMimeTypeGgDrive,
  validateSizeDropbox,
  validateSizeGgDrive,
} from '@/app/utils/validation';
import { AUTH_ENPOINT_BOX, AUTH_ENPOINT_MY_CASE, ENPOINT_API_Drive } from '@/config';
import { useUploadDocsMagnaContext } from '@/contexts/UploadDocsMagnaContext';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Spinner,
  ToastIntent,
} from '@fluentui/react-components';
import classNames from 'classnames';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useRef, useState } from 'react';
import { CallbackDoc, PickerCallback } from 'react-google-drive-picker/dist/typeDefs';
import useDrivePicker from '../../../../(dashboard)/discovery-tool/components/cloud-storage/lib/index';
import { useChatStore } from '../../chat/chat-store';
import useUploadDocument from '../../chat/useUploadDocument';
import { useProfileStore } from '@/app/_components/profile/profile-store';
import { checkFolderInDocs, getAllFileEntries } from '@/app/utils/dragDropDocs';
import { isEnoughStorage } from '@/app/utils/checkResourceLeft';
import BuyMoreResourceDialog from '@/app/_components/common/BuyMoreResourceDialog';
import { useMyCaseContext } from '@/contexts/MyCaseContext';
import { useBookmarkContext } from '@/contexts/BookmarkContext';

type Props = {
  open: boolean;
  onCancel: () => void;
  setShowDialogUploadDocs: (v: boolean) => void;
  setErrorMessage: (newMessage: string) => void;
  firstTimeShowToast: boolean;
  setFirstTimeShowToast: (v: boolean) => void;
  fileSelected: any[];
  setFileSelected: React.Dispatch<React.SetStateAction<any[]>>;
  previewUploadFile: PreviewFile[];
  setPreviewUploadFile: React.Dispatch<React.SetStateAction<PreviewFile[]>>;
  setIntent: (v: ToastIntent | 'none') => void;
  showToast: () => void;
  onShowErr: (v: string, s?: boolean) => void;
  setOpenMyCase?: (v: boolean) => void;
  setShowErrDoesNotPermission: (v: boolean) => void;
  ggDriveLoading: boolean;
  setGgDriveLoading: (v: boolean) => void;
  onShowErrLargeDocument: (msg: string) => void;
};

interface IFileDrive {
  mimeType: string;
  parents: string[];
  id: string;
  name: string;
  pathParent?: string;
}

const data = [
  {
    id: 1,
    tile: 'Box',
    img_url: '/svg/box-logo-icon.svg',
    type: TypeCloudStorage.BOX,
  },
  {
    id: 2,
    tile: 'Goolge Drive',
    img_url: '/svg/drive-logo-icon.svg',
    type: TypeCloudStorage.GOOGLE_DRIVE,
  },
  {
    id: 3,
    tile: 'Dropbox',
    img_url: '/svg/dropbox-logo-icon.svg',
    type: TypeCloudStorage.DROP_BOX,
  },
];

const DialogUploadDocsMagna = ({
  open,
  onCancel,
  setShowDialogUploadDocs,
  fileSelected,
  setFileSelected,
  setErrorMessage,
  previewUploadFile,
  setPreviewUploadFile,
  firstTimeShowToast,
  setFirstTimeShowToast,
  onShowErr,
  setOpenMyCase,
  setShowErrDoesNotPermission,
  ggDriveLoading,
  setGgDriveLoading,
  onShowErrLargeDocument,
}: Props) => {
  console.log('fileSelected', fileSelected);
  const [openPicker, authRes] = useDrivePicker();
  const router = useRouter();

  const { onSubmitUploadDocsMagna } = useUploadDocument();
  const { isAlreadyHasDocument, setChatThread } = useChatStore();
  const {
    isPlusPlan,
    isPreviewScreen,
    onSetIsPreviewScreen,
    refFolAlreadyExists,
    setRefFolAlreadyExists,
  } = useUploadDocsMagnaContext();
  const { myCaseAccessToken } = useMyCaseContext();
  const { resetBookmark } = useBookmarkContext();

  const refAuthRes = useRef<string>();
  const refFolderStorage = useRef<IFileDrive[]>([]);
  const refFolderId = useRef<string>();
  const [showCreateChatDialog, setShowCreateChatDialog] = useState(false);
  const [conversationId] = useQueryState('c', parseAsString);
  const { profileInfo, resourceInfo } = useProfileStore();
  const isSupportMycase = profileInfo?.current_subscription?.subscription_plan?.support_mycase;

  const dropZoneRef = useRef<any>(null);
  const dropZoneBlurRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showBuyMoreResourceDialog, setShowBuyMoreResourceDialog] = useState(false);
  const [message, setMessage] = useState<string | undefined>('');

  useEffect(() => {
    const handleDragOver = (event: any) => {
      event.preventDefault();
      if (isPreviewScreen) {
        setIsDragging(true);
      }
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
  }, [isPreviewScreen]);

  useEffect(() => {
    const handleDragLeave = (e: any) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = async (event: any) => {
      event.preventDefault();
      console.log('event.dataTransfer.items--->', event.dataTransfer.items);
      if (event.dataTransfer.items) {
        const folAlreadyExists = checkFolderInDocs(event.dataTransfer.items);
        if (folAlreadyExists && isPlusPlan && refFolAlreadyExists) {
          onShowErr(
            'You can only upload one folder at a time. Please upgrade your plan to add more.',
          );
          setIsDragging(false);
          return;
        }
      }
      const files: any = await getAllFileEntries(event.dataTransfer.items);
      const fileList = files.reduce((acc: File[], val: File[]) => acc.concat(val), []);
      let totalSize = 0;

      if (resourceInfo && !isEnoughStorage(resourceInfo).isEnough) {
        setMessage(isEnoughStorage(resourceInfo).message);
        setShowBuyMoreResourceDialog(true);
        setIsDragging(false);
        return;
      }

      if (fileList && fileList.length > 0) {
        const isNotValidate = fileList.every((file: File) => {
          const message = validateFile(file);
          totalSize += file.size;
          if (resourceInfo && !isEnoughStorage(resourceInfo, totalSize).isEnough) {
            setMessage(isEnoughStorage(resourceInfo, totalSize).message);
            setShowBuyMoreResourceDialog(true);
            setIsDragging(false);
            return;
          }
          if (message !== 'OK') {
            setErrorMessage(message);
            return true;
          }
          return false;
        });
        if (!isNotValidate) {
          setErrorMessage('');
          setFileSelected((prevFiles) => [...prevFiles, ...fileList]);
        }
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

  useEffect(() => {
    const ls = _.uniqBy(fileSelected, 'id'); //remove duplicate file by id
    setRefFolAlreadyExists(
      ls.filter((file) => {
        return file?.webkitRelativePath !== '' || file?.path;
      }).length > 0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSelected]);

  useEffect(() => {
    const isHasFolder = checkDocsHasFolder(previewUploadFile);
    if (firstTimeShowToast && isHasFolder) {
      onShowErr(
        'I noticed you uploaded a folder. Please ensure folders contain only PDFs, Docs, Docx, Excel and images for successful uploads!',
      );
      setFirstTimeShowToast(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUploadFile, firstTimeShowToast, onShowErr]);

  useEffect(() => {
    // event listens for local storage changes
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'authBoxCode') {
        router.push('/legal-chat?box=true');
        setShowDialogUploadDocs(false);
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  });

  useEffect(() => {
    if (authRes) {
      refAuthRes.current = authRes.access_token;
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authRes]);

  const onSelectFiles = (files: any[]) => {
    const id = generateId();
    const filesWithId: any[] = files.map((file) => {
      if (file?.isFileCloudStorage) {
        return file;
      }
      const updatedFile = file;
      const { webkitRelativePath, path } = file;
      if (webkitRelativePath !== '' || path) {
        updatedFile['id'] = id;
      } else {
        updatedFile['id'] = generateId();
      }
      return updatedFile;
    });
    console.log('filesWithId--->', filesWithId);
    setFileSelected((prevFiles) => [...prevFiles, ...filesWithId]);
    onSetIsPreviewScreen(true);
  };

  const onAddMore = () => {
    onSetIsPreviewScreen(false);
  };

  const handleGetBlobFile = (fileInfo: IFileDrive) => {
    const msg = validateMimeTypeGgDrive(fileInfo.mimeType);
    if (msg !== 'OK') {
      setErrorMessage(msg);
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `${ENPOINT_API_Drive}/${fileInfo.id}?alt=media`, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + refAuthRes.current);
    xhr.responseType = 'blob';
    xhr.onload = function () {
      var blob = xhr.response;
      const msg = validateSizeGgDrive(blob.size);
      if (msg !== 'OK') {
        setErrorMessage(msg);
        return;
      }
      let path = '';
      const fol = refFolderStorage.current.find((item) => fileInfo.parents[0] === item.id);
      if (fol) {
        path = fol?.pathParent ? fol.pathParent : fol.name;
      }
      const file = {
        webkitRelativePath: path + '/' + fileInfo.name,
        name: fileInfo.name,
        size: blob.size,
        blob: blob,
        isFileCloudStorage: true,
        id: refFolderId.current,
      };
      onSelectFiles([file]);
    };
    xhr.send();
  };

  const listFiles = async (folderId: string, token: string, oldPath?: string) => {
    try {
      let pathRoot = oldPath || '';
      const response = await fetch(
        `${ENPOINT_API_Drive}?q=%27${folderId}%27+in+parents&fields=files(id%2Cname%2CmimeType%2Cparents)`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      data?.files.forEach((file: IFileDrive) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          if (isPlusPlan) {
            return;
          }
          refFolderStorage.current.map((folder: IFileDrive) => {
            if (file.parents[0] === folder.id) {
              refFolderStorage.current = [
                ...refFolderStorage.current,
                {
                  ...file,
                  pathParent:
                    `${folder?.pathParent ? folder.pathParent : folder.name}` + '/' + file.name,
                },
              ];
            }
          });
          pathRoot += '/' + file.name;
          listFiles(file.id, token, pathRoot);
          setErrorMessage('');
        } else {
          handleGetBlobFile(file);
        }
      });
    } catch (error) {
      console.error('Error listing files:', error);
    }
  };

  async function uploadFile(type: TypeCloudStorage, fileInfo: any) {
    if (refAuthRes.current && type === TypeCloudStorage.GOOGLE_DRIVE) {
      if (fileInfo.type === 'folder') {
        refFolderStorage.current = [...refFolderStorage.current, fileInfo];
        refFolderId.current = fileInfo.id;
        listFiles(fileInfo.id, refAuthRes.current, fileInfo.name);
        setErrorMessage('');
      } else {
        const msg = validateFileGgDrive(fileInfo);
        if (msg === 'OK') {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', `${ENPOINT_API_Drive}/${fileInfo.id}?alt=media`, true);
          xhr.setRequestHeader('Authorization', 'Bearer ' + refAuthRes.current);
          xhr.responseType = 'blob';
          xhr.onload = function () {
            var blob = xhr.response;
            const file = {
              webkitRelativePath: '',
              name: fileInfo.name,
              size: blob.size,
              blob: blob,
              isFileCloudStorage: true,
              id: fileInfo.id,
            };
            onSelectFiles([file]);
            setErrorMessage('');
          };
          xhr.send();
        } else {
          setErrorMessage(msg);
        }
      }
    } else if (type === TypeCloudStorage.DROP_BOX) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', fileInfo?.link, true);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        var blob = xhr.response;
        const file = {
          webkitRelativePath: '',
          name: fileInfo.name,
          size: blob.size,
          blob: blob,
        };
        const msg = validateSizeDropbox(blob?.size, blob?.type);
        if (msg === 'OK') {
          onSelectFiles([file]);
          setErrorMessage('');
        } else {
          setErrorMessage(msg);
        }
      };
      xhr.send();
    }
  }

  const uploadFiles = async (type: TypeCloudStorage, files: any) => {
    const filesIncludeFolder = files.filter((file: any) => file?.type === 'folder').length;
    if (isPlusPlan && refFolAlreadyExists && filesIncludeFolder) {
      onShowErr('You can only upload one folder at a time. Please upgrade your plan to add more.');
      return;
    }
    try {
      await Promise.all(
        files.map(async (item: IFileDriveSelected) => {
          const msg = validateFileGgDrive(item);
          if (item.type !== 'folder' && msg !== 'OK') {
            setErrorMessage(msg);
          } else {
            uploadFile(type, item);
          }
        }),
      );
    } catch (error) {
      console.error('Error fetching data for each item:', error);
    }
  };

  const handleFilesSelected = (
    type: TypeCloudStorage,
    files: CallbackDoc[] | IFileDropboxSelected[],
  ) => {
    if (type === TypeCloudStorage.DROP_BOX) {
      onSetIsPreviewScreen(true);
    }
    onSetIsPreviewScreen(true);
    uploadFiles(type, files);
  };

  const handleSelectCloudStorage = async (type?: TypeCloudStorage) => {
    if (type === TypeCloudStorage.GOOGLE_DRIVE) {
      openPicker({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID || '',
        developerKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || '',
        viewId: 'DOCS',
        showUploadView: true,
        showUploadFolders: true,
        supportDrives: true,
        multiselect: true,
        setIncludeFolders: true,
        setSelectFolderEnabled: true, // check selected folders
        callbackFunction: (data: PickerCallback) => {
          if (data.action === 'cancel') {
            console.log('User clicked cancel/close button');
          }
          const files: CallbackDoc[] = data?.docs;
          if (files && files.length) {
            setGgDriveLoading(true);
            setShowDialogUploadDocs(true);
            handleFilesSelected(TypeCloudStorage.GOOGLE_DRIVE, files);
          }
        },
      });
    } else if (type === TypeCloudStorage.BOX) {
      const authUrl = `${AUTH_ENPOINT_BOX}?client_id=${process.env.NEXT_PUBLIC_BOX_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_WEB_DOMAIN}/legal-chat?box=true`;
      window.open(authUrl, 'box', 'width=500,height=500');
    } else if (type === TypeCloudStorage.MY_CASE) {
      if (myCaseAccessToken) {
        setOpenMyCase && setOpenMyCase(true);
        setShowDialogUploadDocs(false);
      } else {
        const authUrl = `${AUTH_ENPOINT_MY_CASE}?client_id=${process.env.NEXT_PUBLIC_MY_CASE_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_MY_CASE_CLIENT_SECRET}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_WEB_DOMAIN}/legal-chat/mycase`;
        window.open(authUrl, 'my_case', 'width=500,height=500');
      }
    }
  };

  const handleCancel = () => {
    onCancel();
    onSetIsPreviewScreen(false);
    setPreviewUploadFile([]);
    setFileSelected([]);
    setFirstTimeShowToast(true);
    setRefFolAlreadyExists(false);
  };

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

  const handleShowErrDoesNotPermission = (errMsg?: string) => {
    if (errMsg) {
      onShowErrLargeDocument(errMsg);
    } else {
      setShowErrDoesNotPermission(true);
    }
  };

  const upload = async () => {
    const formData = new FormData();
    let name = '';

    for (const file of fileSelected) {
      const message = validateFile(file);
      if (message === 'OK') {
        name = file.name;
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
    formData.append('name', name);

    try {
      await onSubmitUploadDocsMagna(isAlreadyHasDocument, formData, handleShowErrDoesNotPermission);
    } catch (error) {
      console.log('error discovery tool upload: ', error);
      setErrorMessage(`${error}`);
    } finally {
      handleCancel();
    }
  };

  return (
    <>
      <Dialog open={open} modalType='alert'>
        <DialogSurface
          className={classNames('h-[90%] min-w-[100%]', {
            'sm:min-w-[54.375rem]': isPreviewScreen,
            'sm:min-w-[35.5rem]': !isPreviewScreen,
          })}
        >
          <DialogBody className='relative' ref={dropZoneRef}>
            {isDragging && (
              <div
                className={classNames('absolute top-0 z-20 size-full', {
                  'z-20 bg-bg-gray-blur': isDragging,
                  'z-0 bg-white': !isDragging,
                })}
                ref={dropZoneBlurRef}
              ></div>
            )}
            {isPreviewScreen && (
              <DialogTitle className='!text-lg !font-semibold'>Preview</DialogTitle>
            )}
            <DialogContent className='!mt-6 !text-support'>
              {isPreviewScreen ? (
                <>
                  <div className='mb-4 grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4'>
                    {previewUploadFile?.map((file) => (
                      <FileContainer
                        removeUploadFile={() => removeUploadFile(file.id)}
                        key={file.id}
                        fileName={file?.name}
                      />
                    ))}
                    <div
                      className='py- relative mr-2 flex h-[9.375rem] flex-col items-center justify-center gap-3 rounded-lg 
              border-[0.0625rem] border-solid border-color-screen-stroke px-6 hover:cursor-pointer'
                      onClick={onAddMore}
                    >
                      <CustomIcon name='add-more' width={30} height={30} />
                      <div className='text-center text-sm font-[400] text-color-text-default'>
                        <p>Add More</p>
                      </div>
                    </div>
                  </div>
                  <div className='mb-8 mt-10 h-[0.0625rem] w-full bg-neutrual-50' />
                </>
              ) : (
                <>
                  <div className='mb-4 flex w-full flex-col gap-4 rounded-xl border-[0.0625rem] border-solid border-color-item-stroke p-4'>
                    <p className='text-lg font-[600] text-color-text-default'>Cloud Storage</p>
                    <div className='flex w-full flex-col gap-6 font-[600] text-color-text-default sm:flex-row'>
                      {data.map((item) => (
                        <UploadOption
                          key={item.id}
                          title={item.tile}
                          img_url={item.img_url}
                          onclick={handleSelectCloudStorage}
                          type={item.type}
                          handleFilesSelected={handleFilesSelected}
                        />
                      ))}
                    </div>
                  </div>
                  {isSupportMycase && (
                    <div className='mb-4 flex w-full flex-col gap-4 rounded-xl border-[0.0625rem] border-solid border-color-item-stroke p-4'>
                      <p className='text-lg font-[600] text-color-text-default'>Case Management</p>
                      <UploadOption
                        title='My Case'
                        img_url='/svg/mcase-logo-icon.svg'
                        onclick={() => {
                          handleSelectCloudStorage(TypeCloudStorage.MY_CASE);
                        }}
                      />
                    </div>
                  )}
                  <div className='mb-4 flex w-full flex-col gap-4 rounded-xl border-[0.0625rem] border-solid border-color-item-stroke p-4'>
                    <p className='text-lg font-[600] text-color-text-default'>My Computer</p>
                    <PopsOverDevice
                      onSelectFiles={onSelectFiles}
                      setErrorMessage={setErrorMessage}
                      onCancel={() => {}}
                      isMagna={true}
                      onShowErr={onShowErr}
                    />
                  </div>
                  <div className='my-6 h-[0.0625rem] w-full bg-neutrual-50 md:hidden' />
                  <div className='mb-[1.5rem] mt-[2rem] flex w-full justify-end'>
                    <Button
                      className='!w-[30%] !border-aero-10 !text-base !font-semibold sm:w-full'
                      size='large'
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
            {isPreviewScreen && (
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button
                    className='!border-aero-10 !text-base !font-semibold'
                    size='large'
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </DialogTrigger>

                <DialogTrigger disableButtonEnhancement>
                  <Button
                    className={classNames('gap-2 !text-base !font-semibold', {
                      '!bg-aero-7 !text-confirm': !ggDriveLoading,
                    })}
                    size='large'
                    onClick={() => {
                      if (conversationId && isAlreadyHasDocument) {
                        setShowCreateChatDialog(true);
                      } else {
                        upload();
                      }
                    }}
                    type='submit'
                    disabled={ggDriveLoading}
                  >
                    {ggDriveLoading && <Spinner size='tiny' />}
                    Upload Files
                  </Button>
                </DialogTrigger>
              </DialogActions>
            )}
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {showCreateChatDialog && conversationId && (
        <ConfirmDialog
          type='confirm'
          title='Create New Chat'
          content='You are uploading new documents to be used in the chat. This will create a new chat with the selected documents. '
          onCancel={() => {
            handleCancel();
          }}
          onConfirm={() => {
            setChatThread([]);
            resetBookmark();
            upload();
          }}
          textCancel='Cancel'
          textConfirm='Confirm'
          open={showCreateChatDialog}
        />
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
    </>
  );
};

export default DialogUploadDocsMagna;
