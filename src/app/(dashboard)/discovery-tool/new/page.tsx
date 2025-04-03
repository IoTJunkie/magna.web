'use client';
import CustomIcon from '@/app/_components/common/CustomIcon';
import UploadMultiCase from '../components/UploadMultiCase';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useProfileStore } from '@/app/_components/profile/profile-store';
import { validateFile } from '@/app/utils/validation';
import BuyMoreResourceDialog from '@/app/_components/common/BuyMoreResourceDialog';
import { useRouter, useSearchParams } from 'next/navigation';
import BoxContentPicker from './components/BoxContentPicker';
import { AUTH_TOKEN_ENPOINT_BOX, AUTH_TOKEN_ENPOINT_MY_CASE } from '@/config';
import { isEnoughStorage } from '@/app/utils/checkResourceLeft';
import { generateId } from '@/app/utils';
import MyCaseDialog from '@/app/_components/common/MyCase/MyCaseDialog';
import { getAllFileEntries } from '@/app/utils/dragDropDocs';
import { useMyCaseContext } from '@/contexts/MyCaseContext';
import axios from 'axios';

const NewDiscoveryTool = () => {
  // const [showWarning, setShowWarning] = useState(false);
  // const uploadRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<any>(null);
  const dropZoneBlurRef = useRef<any>(null);
  const router = useRouter();
  const { resourceInfo } = useProfileStore();
  const { onSetMyCaseAccessToken } = useMyCaseContext();

  const [isDragging, setIsDragging] = useState(false);
  const [fileSelected, setFileSelected] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [message, setMessage] = useState<string | undefined>('');
  const [showBuyMoreResourceDialog, setShowBuyMoreResourceDialog] = useState(false);
  const [accessTokenBox, setAccessTokenBox] = useState<string>('');
  const [openBox, setOpenBox] = useState(false);
  const [openMyCase, setOpenMyCase] = useState(false);
  const [accessTokenMyCase, setAccessTokenMyCase] = useState<string>('');
  const [isOpenUploadDialog, setIsOpenUploadDialog] = useState(false);
  const searchParams = useSearchParams();
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

        if (response.data) {
          onSetMyCaseAccessToken(response.data);
          setOpenMyCase(true);
        } else {
          console.error('Error fetching Box access token:', response.status);
        }
      } catch (error) {
        console.log('error', error);
      }
    }
  };
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
        setIsOpenUploadDialog(false);
        router.push('/discovery-tool/new');
      }
    }
  }, [searchParams]);

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
    setIsOpenUploadDialog(false);
  };

  useEffect(() => {
    const handleDragLeave = (e: any) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = async (event: any) => {
      event.preventDefault();
      console.log('event.dataTransfer.items--->', event.dataTransfer.items);
      const files: any = await getAllFileEntries(event.dataTransfer.items);
      const fileList = files.reduce((acc: File[], val: File[]) => acc.concat(val), []);
      let totalSize = 0;

      if (resourceInfo && !isEnoughStorage(resourceInfo).isEnough) {
        setMessage(isEnoughStorage(resourceInfo).message);
        setShowBuyMoreResourceDialog(true);
        setIsDragging(false);
        return;
      }

      // const fileList = event.dataTransfer.files;
      // console.log('files ---->', files);
      if (fileList && fileList.length > 0) {
        const isNotValidate = fileList.every((file: File) => {
          const message = validateFile(file);
          totalSize += file.size;
          if (resourceInfo && !isEnoughStorage(resourceInfo, totalSize).isEnough) {
            //set message and showprops
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
          onSelectFiles(fileList);
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

  const blockUpload = (resourceType: string, type: 'empty' | 'close') => {
    if (type === 'empty') {
      setMessage(
        `Your ${resourceType} have run out. Consider exchange more to ensure continued use.`,
      );
    } else {
      setMessage(
        'Your Storage is close to run out. Consider exchange more to ensure continued use.',
      );
    }
    setShowBuyMoreResourceDialog(true);
  };

  const handleClearFileSelected = () => {
    setFileSelected([]);
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
      <CustomIcon name='logo' width={252.25} height={123.16} className='hidden lg:block' />
      <div className='mt-16  text-center font-heading text-[2rem] font-semibold capitalize leading-10 tracking-[0.03125rem] text-neutrual-900 md:mt-0 md:text-[2.75rem] lg:leading-tight xl:text-5xl 2xl:text-6xl'>
        Discovery Pro
      </div>
      <div className='w-full text-center text-base text-support lg:w-1/2'>
        Connect your case file, interact with everything
      </div>

      <UploadMultiCase
        isOpenUploadDialog={isOpenUploadDialog}
        setIsOpenUploadDialog={setIsOpenUploadDialog}
        onSelectFiles={onSelectFiles}
        clearFileSelected={handleClearFileSelected}
        setFileSelected={setFileSelected}
        fileSelected={fileSelected}
        isEnoughStorage={isEnoughStorage}
        blockUpload={blockUpload}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
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

      {accessTokenBox && openBox ? (
        <BoxContentPicker
          accessToken={accessTokenBox}
          openBox={openBox}
          setOpenBox={setOpenBox}
          setErrorMessage={setErrorMessage}
          onSelectFiles={onSelectFiles}
        />
      ) : (
        <></>
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
    </div>
  );
};
export default NewDiscoveryTool;

NewDiscoveryTool.displayName = 'NewDiscoveryTool';
