import { IFileDriveSelected, IFileDropboxSelected, TypeCloudStorage } from '@/app/types/discovery';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components';
import { useEffect, useRef, useState } from 'react';
// import useDrivePicker from 'react-google-drive-picker';
import {
  validateFileGgDrive,
  validateMimeTypeGgDrive,
  validateSizeDropbox,
  validateSizeGgDrive,
} from '@/app/utils/validation';
import { AUTH_ENPOINT_BOX, AUTH_ENPOINT_MY_CASE, ENPOINT_API_Drive } from '@/config';
import { CallbackDoc, PickerCallback } from 'react-google-drive-picker/dist/typeDefs';
import PopsOverDevice from './PopsOverDevice';
import UploadOption from './UploadOption';
import useDrivePicker from './cloud-storage/lib/index';
import { useRouter } from 'next/navigation';
import { useMyCaseContext } from '@/contexts/MyCaseContext';

interface DialogComponentProps {
  open?: boolean;
  type?: 'confirm' | 'notice';
  title?: string;
  content?: JSX.Element | string;
  onCancel: () => void;
  onConfirm?: () => void;
  textCancel?: string;
  textConfirm?: string;
  fileSelected?: any[];
  onSelectFiles: (files: any) => void;
  setErrorMessage: (newMessage: string) => void;
  setOpenMyCase: (v: boolean) => void;
}

interface IFileDrive {
  mimeType: string;
  parents: string[];
  id: string;
  name: string;
  pathParent?: string;
}

const UploadDialog = ({
  title,
  onCancel,
  textCancel = 'No',
  open: isOpen,
  onSelectFiles,
  setErrorMessage,
  setOpenMyCase,
}: DialogComponentProps) => {
  const [open, setOpen] = useState(isOpen);
  const refAuthRes = useRef<string>();
  const refFolderStorage = useRef<IFileDrive[]>([]);
  const refFolderId = useRef<string>();
  const router = useRouter();
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
  const [openPicker, authRes] = useDrivePicker();
  const { myCaseAccessToken } = useMyCaseContext();

  useEffect(() => {
    if (authRes) {
      refAuthRes.current = authRes.access_token;
      onCancel();
    }
  }, [authRes]);

  useEffect(() => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'authBoxCode') {
        router.push('/discovery-tool/new?box=true');
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  });

  const handleGetBlobFile = (fileInfo: IFileDrive) => {
    const msg = validateMimeTypeGgDrive(fileInfo.mimeType);
    if (msg !== 'OK') {
      // setErrorMessage(msg);
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
        // setErrorMessage(msg);
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
      onCancel();
    }
    uploadFiles(type, files);
  };

  const handleSelectCloudStorage = (type?: TypeCloudStorage) => {
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
          const files: CallbackDoc[] = data.docs;
          handleFilesSelected(TypeCloudStorage.GOOGLE_DRIVE, files);
        },
      });
    } else if (type === TypeCloudStorage.BOX) {
      const authUrl = `${AUTH_ENPOINT_BOX}?client_id=${process.env.NEXT_PUBLIC_BOX_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_WEB_DOMAIN}/discovery-tool/new?box=true`;
      window.open(authUrl, 'box', 'width=500,height=500');
    } else if (type === TypeCloudStorage.MY_CASE) {
      if (myCaseAccessToken) {
        setOpenMyCase && setOpenMyCase(true);
      } else {
        const authUrl = `${AUTH_ENPOINT_MY_CASE}?client_id=${process.env.NEXT_PUBLIC_MY_CASE_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_MY_CASE_CLIENT_SECRET}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_WEB_DOMAIN}/discovery-tool/mycase`;
        window.open(authUrl, 'my_case', 'width=500,height=500');
      }
    }
  };

  async function getAccessToken() {}
  const handleUploadMycase = async () => {
    await getAccessToken();
  };

  return (
    <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)} modalType='alert'>
      <DialogSurface className='!sm:h-[95%] !h-[90%] w-[90%] !overflow-y-auto border-b-[0.0625rem] border-solid border-b-color-item-stroke sm:w-auto md:min-w-[26.25rem]'>
        <DialogBody>
          <DialogTitle className='!text-lg !font-semibold'>{title}</DialogTitle>
          <DialogContent className='h-fit overflow-y-hidden !text-support sm:h-fit'>
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
            <div
              className='mb-4 flex w-full flex-col gap-4 rounded-xl border-[0.0625rem] border-solid border-color-item-stroke p-4'
              onClick={handleUploadMycase}
            >
              <p className='text-lg font-[600] text-color-text-default'>Case Management</p>
              <UploadOption
                title='My Case'
                img_url='/svg/mcase-logo-icon.svg'
                onclick={() => {
                  handleSelectCloudStorage(TypeCloudStorage.MY_CASE);
                }}
              />
            </div>
            <div className='mb-4 flex w-full flex-col gap-4 rounded-xl border-[0.0625rem] border-solid border-color-item-stroke p-4'>
              <p className='text-lg font-[600] text-color-text-default'>My Computer</p>
              <PopsOverDevice
                onSelectFiles={onSelectFiles}
                setErrorMessage={setErrorMessage}
                onCancel={onCancel}
              />
            </div>
            <div className='my-6 h-[0.0625rem] w-full bg-neutrual-50 md:hidden' />
            <div className='mb-[1.5rem] mt-[2rem] flex w-full justify-end'>
              <Button
                className='!w-[30%] !border-aero-10 !text-base !font-semibold sm:w-full'
                size='large'
                onClick={onCancel}
              >
                {textCancel}
              </Button>
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default UploadDialog;

UploadDialog.displayName = 'DialogComponent';
