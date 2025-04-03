import { PreviewFile } from '@/app/(dashboard)/discovery-tool/components/UploadMultiCase';
import BoxContentPicker from '@/app/(dashboard)/discovery-tool/new/components/BoxContentPicker';
import MyCaseDialog from '@/app/_components/common/MyCase/MyCaseDialog';
import useToastComponent from '@/app/hooks/Toast';
import { generateId } from '@/app/utils';
import { AUTH_TOKEN_ENPOINT_BOX } from '@/config';
import { useMyCaseContext } from '@/contexts/MyCaseContext';
import { useUploadDocsMagnaContext } from '@/contexts/UploadDocsMagnaContext';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DialogErrorPermissionMagna from './DialogErrorPermissionMagna';
import DialogUploadDocsMagna from './DialogUploadDocsMagna';

type Props = {
  showDialogUploadDocs: boolean;
  setShowDialogUploadDocs: (v: boolean) => void;
};

const UploadDocsMagna = ({ showDialogUploadDocs, setShowDialogUploadDocs }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { onSetIsPreviewScreen } = useUploadDocsMagnaContext();

  const [msg, setMsg] = useState('');

  const { showToast, toasterComponent, setIntent, hideToast } = useToastComponent({
    content: msg,
    timeoutProps: 5000,
  });

  const [accessTokenBox, setAccessTokenBox] = useState<string>('');
  const [openBox, setOpenBox] = useState(false);
  const [openMyCase, setOpenMyCase] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fileSelected, setFileSelected] = useState<any[]>([]);
  const [previewUploadFile, setPreviewUploadFile] = useState<PreviewFile[]>([]);
  const [firstTimeShowToast, setFirstTimeShowToast] = useState(true);
  const { myCaseAccessToken, onSetMyCaseAccessToken } = useMyCaseContext();
  const [showErrDoesNotPermission, setShowErrDoesNotPermission] = useState(false);
  const [ggDriveLoading, setGgDriveLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGgDriveLoading(false);
    }, 1500);
    //clear setTimeout
    return () => {
      clearTimeout(timer);
    };
  }, [fileSelected]);

  useEffect(() => {
    if (errorMessage) {
      setMsg(errorMessage);
      setIntent('error');
      showToast();
      setErrorMessage('');
    }
  }, [errorMessage]);

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

  const getAccessTokenBox = async (authorizationCode: string) => {
    if (authorizationCode) {
      try {
        const response = await fetch(AUTH_TOKEN_ENPOINT_BOX, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: authorizationCode,
            client_id: process.env.NEXT_PUBLIC_BOX_CLIENT_ID || '',
            client_secret: process.env.NEXT_PUBLIC_BOX_CLIENT_SECRET || '',
          }),
        });
        if (response.ok) {
          const accessToken = await response.json();
          setAccessTokenBox(accessToken.access_token);
          setOpenBox(true);
        } else {
          console.error('Error fetching Box access token:', response.status);
        }
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  useEffect(() => {
    const authorizationBox = searchParams.get('box');
    if (authorizationBox === 'true') {
      const code = searchParams.get('code') || '';
      const authCode = localStorage.getItem('authBoxCode');
      if (code) {
        // small tab login
        const code = searchParams.get('code') || '';
        localStorage.setItem('authBoxCode', code);
        window.close();
      } else if (!code && authCode) {
        // get auth box code in my site
        getAccessTokenBox(localStorage.getItem('authBoxCode') || '');
        localStorage.setItem('authBoxCode', '');
        // setIsOpenUploadDialog(false);
        // router.push('/legal-chat');
        router.replace('/legal-chat');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const getAccessTokenMyCase = async (authorizationCode: string) => {
    if (authorizationCode) {
      try {
        const response = await axios.post(
          '/api/mycase/token',
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Host: 'auth.mycasekegging.com',
              Accept: '*/*',
              body: JSON.stringify({
                grant_type: 'authorization_code',
                code: decodeURIComponent(authorizationCode),
                client_id: process.env.NEXT_PUBLIC_MY_CASE_CLIENT_ID || '',
                client_secret: process.env.NEXT_PUBLIC_MY_CASE_CLIENT_SECRET || '',
                redirect_uri: `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/discovery-tool/mycase`,
              }),
            },
          },
          {},
        );

        if (response.data?.access_token) {
          onSetMyCaseAccessToken(response.data);
          setShowDialogUploadDocs(false);
          setOpenMyCase(true);
        } else {
          setIntent('error');
          setMsg(response.data?.error_description);
          showToast();
          console.error('Error fetching Box access token:', response.status);
        }
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  useEffect(() => {
    // Function to handle localStorage change
    const handleStorageChange = () => {
      const authCode = localStorage.getItem('authMycaseCode');
      if (authCode) {
        getAccessTokenMyCase(authCode);
        localStorage.setItem('authMycaseCode', '');
      }
    };
    // Listen to storage changes in other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Initial fetch of localStorage value
    handleStorageChange();

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const onSelectFiles = (files: any[]) => {
    const id = generateId();

    onSetIsPreviewScreen(true);
    setShowDialogUploadDocs(true);

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
  };

  const handleCloseBox = () => {
    onSetIsPreviewScreen(true);
    setShowDialogUploadDocs(true);
  };

  const onShowErr = (msg: string) => {
    setIntent('warning');
    setMsg(msg);
    showToast();
    setTimeout(() => {
      document.getElementById('LegalChatPage')?.click();
      hideToast();
    }, 3000);
  };

  const onShowErrLargeDocument = (msg: string) => {
    setIntent('error');
    setMsg(msg);
    showToast();
  };

  return (
    <div>
      {showDialogUploadDocs && (
        <DialogUploadDocsMagna
          open={showDialogUploadDocs}
          onCancel={() => {
            setShowDialogUploadDocs(false);
          }}
          setShowDialogUploadDocs={setShowDialogUploadDocs}
          fileSelected={fileSelected}
          setFileSelected={setFileSelected}
          setErrorMessage={setErrorMessage}
          previewUploadFile={previewUploadFile}
          setPreviewUploadFile={setPreviewUploadFile}
          firstTimeShowToast={firstTimeShowToast}
          setFirstTimeShowToast={setFirstTimeShowToast}
          setIntent={setIntent}
          showToast={showToast}
          onShowErr={onShowErr}
          setOpenMyCase={setOpenMyCase}
          setShowErrDoesNotPermission={setShowErrDoesNotPermission}
          ggDriveLoading={ggDriveLoading}
          setGgDriveLoading={setGgDriveLoading}
          onShowErrLargeDocument={onShowErrLargeDocument}
        />
      )}
      {accessTokenBox && openBox ? (
        <BoxContentPicker
          accessToken={accessTokenBox}
          openBox={openBox}
          setOpenBox={setOpenBox}
          setErrorMessage={setErrorMessage}
          onSelectFiles={onSelectFiles}
          handleCloseBox={handleCloseBox}
          onShowErr={onShowErr}
          setShowDialogUploadDocs={setShowDialogUploadDocs}
        />
      ) : (
        <></>
      )}
      {openMyCase ? (
        <MyCaseDialog
          open={openMyCase}
          setOpen={setOpenMyCase}
          setFileSelected={setFileSelected}
          setShowDialogUploadDocs={setShowDialogUploadDocs}
          isMagnaPage={true}
        />
      ) : (
        <></>
      )}
      {showErrDoesNotPermission && (
        <DialogErrorPermissionMagna
          open={showErrDoesNotPermission}
          onClose={() => {
            setShowErrDoesNotPermission(false);
          }}
          onConfirm={() => {
            router.push('/settings/billing-subscription');
            setShowErrDoesNotPermission(false);
          }}
        />
      )}
      {toasterComponent}
    </div>
  );
};

export default UploadDocsMagna;
