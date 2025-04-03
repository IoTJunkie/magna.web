import { IFileBoxSelected, IResponseSelectedBox } from '@/app/types/discovery';
import { validateFileBox } from '@/app/utils/validation';
import { ENPOINT_API_BOX } from '@/config';
import { useUploadDocsMagnaContext } from '@/contexts/UploadDocsMagnaContext';
import { Dialog, DialogBody, DialogContent, DialogSurface } from '@fluentui/react-components';
import classNames from 'classnames';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { IntlProvider } from 'react-intl';

interface IProps {
  accessToken: string;
  openBox: boolean;
  setOpenBox: (value: boolean) => void;
  setErrorMessage: (newMessage: string) => void;
  onSelectFiles: (files: any[]) => void;
  handleCloseBox?: () => void;
  onShowErr?: (v: string) => void;
  setShowDialogUploadDocs?: (v: boolean) => void;
}

const BoxContentPicker = (props: IProps) => {
  const {
    accessToken,
    openBox,
    setOpenBox,
    setErrorMessage,
    onSelectFiles,
    handleCloseBox,
    onShowErr,
    setShowDialogUploadDocs,
  } = props;
  const { isPlusPlan, refFolAlreadyExists, onSetIsPreviewScreen } = useUploadDocsMagnaContext();

  const [disabledBtn, setDisabledBtn] = useState(false);
  const [BoxUIElements, setBoxUIElements] = useState<any>(null);
  const refFolderStorage = useRef<IFileBoxSelected[]>([]);
  const refFolderId = useRef<string>();
  const handleClose = () => {
    setOpenBox(false);
  };
  useEffect(() => {
    const loadBoxUI = async () => {
      const ContentPicker = await import(
        'box-ui-elements/es/elements/content-picker/ContentPicker'
      );
      setBoxUIElements(ContentPicker);
    };
    loadBoxUI();
  }, []);

  const handleGetBlobFile = (fileInfo: IFileBoxSelected, rootFile?: boolean) => {
    const msg = validateFileBox(fileInfo);
    if (msg !== 'OK') {
      // setErrorMessage(msg);
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `${ENPOINT_API_BOX}/files/${fileInfo.id}/content`, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.responseType = 'blob';
    xhr.onload = function () {
      var blob = xhr.response;
      let path = '';
      if (!rootFile) {
        const fol = refFolderStorage.current.find((item) => fileInfo?.parent?.id === item.id);
        if (fol) {
          path = fol?.pathParent ? fol.pathParent : fol.name;
        }
      }
      const file = {
        webkitRelativePath: rootFile ? '' : path + '/' + fileInfo.name,
        name: fileInfo.name,
        size: blob.size,
        blob: blob,
        isFileCloudStorage: true,
        id: rootFile ? fileInfo.id : refFolderId.current,
      };
      setErrorMessage('');
      onSelectFiles([file]);
    };
    xhr.send();
  };

  const handleGetDocsFolder = async (folderId: string) => {
    try {
      const response = await fetch(
        `${ENPOINT_API_BOX}/folders/${folderId}/items?fields=id,type,name,size,parent`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data = await response.json();
      data?.entries.forEach((file: IFileBoxSelected) => {
        if (file.type === 'folder') {
          if (isPlusPlan) {
            return;
          }
          refFolderStorage.current.map((folder: IFileBoxSelected) => {
            if (file?.parent?.id === folder.id) {
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
          handleGetDocsFolder(file.id);
        } else {
          handleGetBlobFile(file);
        }
      });
    } catch (error) {
      console.error('Error listing files:', error);
    }
  };

  const uploadFile = (fileInfo: IFileBoxSelected) => {
    if (fileInfo.type === 'folder') {
      refFolderStorage.current = [...refFolderStorage.current, fileInfo];
      refFolderId.current = fileInfo.id;
      handleGetDocsFolder(fileInfo.id);
      setErrorMessage('');
    } else {
      handleGetBlobFile(fileInfo, true);
    }
  };

  const handleFileBoxSelected = async (docs: IFileBoxSelected[]) => {
    const filesIncludeFolder = docs.filter((file: any) => file?.type === 'folder').length;
    if (isPlusPlan && refFolAlreadyExists && filesIncludeFolder) {
      onShowErr &&
        onShowErr(
          'You can only upload one folder at a time. Please upgrade your plan to add more.',
        );
      handleCloseBox && handleCloseBox();
      handleClose();
      return;
    }
    try {
      await Promise.all(
        docs.map(async (item: IFileBoxSelected) => {
          const msg = validateFileBox(item);
          if (item.type !== 'folder' && msg !== 'OK') {
            setErrorMessage(msg);
          } else {
            uploadFile(item);
          }
        }),
      );
      handleClose();
    } catch (error) {
      console.error('Error fetching data for each item:', error);
    } finally {
      setTimeout(() => {
        onSetIsPreviewScreen(true);
        setShowDialogUploadDocs && setShowDialogUploadDocs(true);
      }, 150);
    }
  };

  if (!BoxUIElements) return;
  const renderCustomActionButtons = (val: IResponseSelectedBox) => {
    setDisabledBtn(val.selectedItems.length > 0);
    return (
      <div className='flex h-9 cursor-pointer'>
        <div
          className='flex h-full w-10 items-center justify-center rounded-l-md border border-r-0'
          onClick={handleClose}
        >
          <Image alt='' src='/svg/close-select-box.svg' width={14} height={14} />
        </div>
        <div
          className={classNames(
            'flex h-full w-10 items-center justify-center rounded-r-md border bg-[#0061d5] text-white',
            {
              'opacity-100': disabledBtn,
              'cursor-not-allowed opacity-70': !disabledBtn,
            },
          )}
          onClick={() => {
            if (disabledBtn) {
              handleFileBoxSelected(val.selectedItems);
            }
          }}
        >
          <Image alt='' src='/svg/done-select-box.svg' width={14} height={14} />
        </div>
      </div>
    );
  };
  return (
    <Dialog open={openBox} modalType='alert'>
      <DialogSurface className='w-[100%] md:min-w-[26.25rem]'>
        <DialogBody>
          <DialogContent className='!text-support'>
            <IntlProvider locale='en'>
              <BoxUIElements.ContentPickerComponent
                token={accessToken}
                language='en-US'
                renderCustomActionButtons={renderCustomActionButtons}
                logoUrl=''
                type={['file', 'folder']}
              />
            </IntlProvider>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default BoxContentPicker;
