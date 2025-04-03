'use client';
import BuyMoreResourceDialog from '@/app/_components/common/BuyMoreResourceDialog';
import ConfirmDialog from '@/app/_components/common/ConfirmDialog';
import DialogError from '@/app/_components/common/DialogError';
import PreviewFile from '@/app/_components/common/PreviewFile';
import Chat from '@/app/_components/conversation/chat';
import DialogErrorPermissionMagna from '@/app/_components/conversation/chat-input/components/DialogErrorPermissionMagna';
import { useChatStore } from '@/app/_components/conversation/chat/chat-store';
import useUploadDocument from '@/app/_components/conversation/chat/useUploadDocument';
import IntroduceSection from '@/app/_components/conversation/introduce-section';
import { MagnaMobileTabs } from '@/app/_components/magna-ai/mobile-tabs';
import { useProfileStore } from '@/app/_components/profile/profile-store';
import { fileTypeAllowUpload } from '@/app/constant';
import useToastComponent from '@/app/hooks/Toast';
import { FileDoc } from '@/app/types/fileDoc';
import { ExtractionStatus } from '@/app/types/policy';
import { isTrialEnded } from '@/app/utils/checkTrialEnded';
import { Spinner } from '@fluentui/react-components';
import axios from 'axios';
import classNames from 'classnames';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { FC, useEffect, useRef, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';

// const textChatSummaryDocsFile = 'Write a letter summarizing the uploaded document to my client.';
const validFileTypes = fileTypeAllowUpload.join(', ');

const LegalChatPage: FC = () => {
  const {
    isOldChatFetchError,
    isAlreadyHasDocument,
    statusUploadDocument,
    setStatusUploadDocument,
    setIsAlreadyHasDocument,
    loadingTheReplacementFile,
    appendedChatSummary,
    setChatThread,
    error,
    setError,
  } = useChatStore();
  const [linkDocs, setLinkDocs] = useState<FileDoc[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [openDialogErr, setOpenDialogErr] = useState(false);
  const [allowShowActionResultSummary, setAllowShowActionResultSummary] = useState(false);
  const [isRunningGetSummary, setIsRunningGetSummary] = useState(false);
  const [conversationId] = useQueryState('c', parseAsString);
  const currentConversationId = useRef<string | null>(null);
  // const [isDragging, setIsDragging] = useState(false);
  const [expandDocs, setExpandDocs] = useState(false);
  const [msg, setMsg] = useState<JSX.Element | string | undefined>('');
  const [titlePopupError, setTitlePopupError] = useState('');
  const [contentPopupError, setContentPopupError] = useState('');
  const [showBuyMoreResourceDialog, setShowBuyMoreResourceDialog] = useState(false);
  const [showCreateChatDialog, setShowCreateChatDialog] = useState(false);
  const [showAccessRestrictedDialog, setShowAccessRestrictedDialog] = useState<boolean>(false);
  const [fileDocs, setFileDocs] = useState<FileDoc[]>();
  const [showErrDoesNotPermission, setShowErrDoesNotPermission] = useState(false);
  const sttShowDialogErr = useRef(false);
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 640;

  const { showToast, setIntent, toasterComponent } = useToastComponent({
    content: msg || '',
  });
  const { profileInfo, documentSizeLimit } = useProfileStore();

  const handleShowErr = (msg: string) => {
    setIntent('error');
    setMsg(msg);
    showToast();
    // setIsDragging(false);
  };

  const { onSubmitFile } = useUploadDocument(handleShowErr);

  const router = useRouter();

  const trialHasEnded =
    isTrialEnded(profileInfo?.current_subscription?.trial_period_end as string) &&
    profileInfo?.current_subscription?.price_plan === null;
  const handleExtractionFailed = () => {
    setStatusUploadDocument(ExtractionStatus.ERROR);
    setIsRunning(false);
    if (allowShowActionResultSummary) {
      setTitlePopupError('Extraction failed');
      setContentPopupError(
        "We're having trouble reading the content of this file. Please try uploading again.",
      );
      setOpenDialogErr(true);
    }
  };

  const showDialog = () => {
    const elm = document.getElementById('dialog-error-permission-magna');
    if (!elm) {
      setShowErrDoesNotPermission(true);
      sttShowDialogErr.current = true;
    }
  };

  useEffect(() => {
    if (error?.response?.status === 403 && sttShowDialogErr.current === false) {
      showDialog();
    }
  }, [error]);

  const getSummary = async () => {
    try {
      const session = await getSession();
      let params: any = {
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      };
      setIsRunningGetSummary(false);
      const res = await axios.get(`/api/plg/chats/session/${conversationId}/summary/`, params);
      if (res?.data?.document_retriever_list.length > 0) {
        if (appendedChatSummary) {
          // await appendTextChat(textChatSummaryDocsFile);
          // queryClient.invalidateQueries(LEGAL_HISTORY_QUERY_KEY);
          // setAppendedChatSummary(false);
        }
        setStatusUploadDocument(ExtractionStatus.SUCCESS);
        setIsRunning(false);
      } else {
        handleExtractionFailed();
      }
    } catch (error: any) {
      console.log('error', error);
      setIsRunningGetSummary(true);
    }
  };

  useEffect(() => {
    currentConversationId.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    let intervalSummary: any = null;
    // loop to call get extracted status
    if (isRunningGetSummary && conversationId) {
      intervalSummary = setInterval(() => {
        getSummary();
      }, 3000);
    }

    return () => {
      clearInterval(intervalSummary);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunningGetSummary, conversationId]);

  // useEffect(() => {
  //   const handleDragOver = (event: any) => {
  //     event.preventDefault();
  //     setIsDragging(true);
  //   };

  //   const dropZoneElement = dropZoneRef.current;
  //   if (dropZoneElement) {
  //     dropZoneElement.addEventListener('dragover', handleDragOver);
  //   }

  //   return () => {
  //     if (dropZoneElement) {
  //       dropZoneElement.removeEventListener('dragover', handleDragOver);
  //     }
  //   };
  // }, []);

  // const checkStorageLeft = (files: any) => {
  //   const fileSizeMB = files.reduce((acc: any, curr: any) => curr.size + acc, 0);
  //   if (resourceInfo && !isEnoughStorage(resourceInfo, fileSizeMB).isEnough) {
  //     setShowBuyMoreResourceDialog(true);
  //     return true;
  //   }
  //   return false;
  // };

  const handleFileUpload = (files: FileDoc[]) => {
    if (trialHasEnded) {
      setShowAccessRestrictedDialog(true);
      return;
    }

    // if (checkStorageLeft(files)) {
    //   setIsDragging(false);
    //   return;
    // }

    const allowedFileTypes = validFileTypes.split(',').map((type) => type.trim());
    const filesType = files.map((file) => `.${file?.name.split('.').pop()}`);
    if (!filesType.every((type) => allowedFileTypes.includes(type.toLowerCase()))) {
      handleShowErr('Invalid File Format, please upload a PDF, DOC, DOCX or image file.');
      return;
    }
    const fileSizeMB = files.reduce((acc, curr) => curr.size + acc, 0) / (1024 * 1024);
    if (fileSizeMB > documentSizeLimit) {
      handleShowErr('The file size exceeds the limit. Please upload a smaller file.');
      return;
    }
    onSubmitFile(isAlreadyHasDocument, files);
  };

  // useEffect(() => {
  //   const handleDragLeave = (e: any) => {
  //     e.preventDefault();
  //     setIsDragging(false);
  //   };

  //   const handleDrop = (event: any) => {
  //     if (trialHasEnded) {
  //       setShowAccessRestrictedDialog(true);
  //       setIsDragging(false);
  //       return;
  //     }
  //     event.preventDefault();
  //     const files: FileDoc[] = Array.from(event.dataTransfer.files);
  //     if (files.length) {
  //       setFileDocs(files);

  //       // setIsDragging(false);
  //       // setShowCreateChatDialog(true);
  //       // setFileDocs(fileDocs);
  //       if (conversationId && isAlreadyHasDocument) {
  //         setIsDragging(false);
  //         setShowCreateChatDialog(true);
  //         setFileDocs(files);
  //         return;
  //       }

  //       handleFileUpload(files);
  //     }
  //     setIsDragging(false);
  //   };

  //   const dropZoneElement = dropZoneBlurRef.current;
  //   if (dropZoneElement) {
  //     dropZoneElement.addEventListener('dragleave', handleDragLeave);
  //     dropZoneElement.addEventListener('drop', handleDrop);
  //   }
  //   return () => {
  //     if (dropZoneElement) {
  //       dropZoneElement.removeEventListener('dragleave', handleDragLeave);
  //       dropZoneElement.removeEventListener('drop', handleDrop);
  //     }
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isDragging]);

  const handleGetExtractionStatus = async (stt?: boolean) => {
    if (!conversationId) return;
    try {
      const session = await getSession();
      let params: any = {
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      };
      const res = await axios.get(
        `/api/plg/chats/session/${conversationId}/text-extraction-status/`,
        params,
      );
      if (!res?.data || !currentConversationId.current) return;
      const extractedStatus = res.data.extracted;
      setLinkDocs(
        res.data?.documents && res.data?.documents.length === 0 ? null : res.data?.documents,
      );
      setIsAlreadyHasDocument(res.data?.documents.length > 0);
      if (!(res.data?.documents.length > 0) && !loadingTheReplacementFile) {
        setIsRunning(false);
        return;
      }

      if (!loadingTheReplacementFile) {
        if (extractedStatus) {
          setStatusUploadDocument(ExtractionStatus.PROCESSING);
          getSummary();
          setIsRunning(false);
        } else if (extractedStatus === null || stt) {
          // dont allow show popup err first render
          // extractedStatus default is null
          setStatusUploadDocument(ExtractionStatus.PROCESSING);
          setIsRunning(true);
        } else {
          handleExtractionFailed();
        }
      } else if (!extractedStatus) {
        setStatusUploadDocument(ExtractionStatus.PROCESSING);
        setIsRunning(true);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    let intervalId: any = null;
    // loop to call get extracted status
    if (isRunning && conversationId) {
      intervalId = setInterval(() => {
        handleGetExtractionStatus();
      }, 3000);
    }

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isRunning, loadingTheReplacementFile]);

  useEffect(() => {
    if (conversationId) {
      handleGetExtractionStatus(true); // call first time
    } else if (conversationId === null) {
      setLinkDocs(null);
    }
    return () => {
      //  clear status when change session chat
      setLinkDocs(null);
      setStatusUploadDocument(null);
      setAllowShowActionResultSummary(false);
      setExpandDocs(false);
      // if (conversationId) {
      // without case add new conversation with upload docs file
      // setAppendedChatSummary(false);
      // }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (statusUploadDocument === ExtractionStatus.PROCESSING) {
      // reupload documents file
      setIsRunning(true);
      setAllowShowActionResultSummary(true);
    }
  }, [statusUploadDocument]);

  const onSetExpandDocs = (stt: boolean) => {
    setExpandDocs(stt);
  };

  return (
    <>
      <div
        role='presentation'
        className='hidden h-full flex-col pb-5 md:flex lg:pb-0'
        id='LegalChatPage'
      >
        {isOldChatFetchError && conversationId ? (
          <div className='max-w-chat-layout mx-auto flex w-full flex-1 flex-col overflow-hidden px-5 lg:mx-auto xl:px-0'>
            <IntroduceSection
              title='Something went wrong'
              description={
                'Unable to generate conversation, please check your network connection and try again!'
              }
              type='legal-chat'
            />
          </div>
        ) : (
          <div className='h-full md:flex'>
            {!isMobile && (
              <div
                className={classNames('relative flex size-full flex-1 flex-col md:px-4 lg:w-3/5', {
                  'lg:min-w-[60%] lg:max-w-[60%]': expandDocs,
                })}
              >
                {/* {isDragging && (
                <div
                  className={classNames(
                    'absolute left-0 z-20 flex size-full flex-col items-center justify-center',
                    {
                      'z-20 bg-bg-gray-blur': isDragging,
                      'z-0 bg-white': !isDragging,
                    },
                  )}
                  ref={dropZoneBlurRef}
                >
                  <div className='pointer-events-none z-0 '>
                    <div className='flex items-center justify-center'>
                      <CustomIcon name='drag-drop-file' width={225} height={190} />
                    </div>
                    <div className='text-center text-white'>
                      <div className='mt-6 text-[2rem] font-semibold '>
                        Drag and drop to upload a file
                      </div>
                      <div className='mt-3'>
                        Accepts .pdf, .doc, .docx and image file type (Maximum file size 20MB)
                      </div>
                    </div>
                  </div>
                </div>
              )} */}
                <Chat
                  emptyChatComponent={
                    <div className='max-w-chat-layout mx-auto flex w-full flex-1 flex-col overflow-hidden px-5 lg:mx-auto xl:px-0'>
                      <IntroduceSection
                        title='Magna AI'
                        description=''
                        type='legal-chat'
                        legalChat
                      />
                    </div>
                  }
                />
              </div>
            )}
            {linkDocs && (
              <div
                className={classNames('hidden transition duration-500 md:block', {
                  'relative lg:w-2/5': !expandDocs,
                  'bg-bg-gray-blur bg-opacity-30 ease-out md:absolute md:h-full md:w-full':
                    expandDocs,
                })}
              >
                <PreviewFile
                  linkDocs={linkDocs}
                  expandDocs={expandDocs}
                  onSetExpandDocs={onSetExpandDocs}
                  docsTree={true}
                />
                {statusUploadDocument === ExtractionStatus.PROCESSING && (
                  <div className='absolute top-0 flex size-full flex-col items-center justify-center gap-[0.75rem] bg-[#0000004D] text-lg font-bold text-color-screen-bg'>
                    <Spinner size='extra-large' />
                    Processing
                  </div>
                )}
                {statusUploadDocument === ExtractionStatus.ERROR && (
                  <div className='absolute top-0 flex size-full flex-col items-center justify-center gap-[0.75rem] bg-[#0000004D] text-lg font-bold text-color-screen-bg'>
                    <Image
                      src='/svg/warning.svg'
                      alt=''
                      width={100}
                      height={100}
                      className='hover:cursor-pointer'
                    />
                    Process failed
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <DialogError
          open={openDialogErr}
          setOpen={setOpenDialogErr}
          onClose={() => {
            setOpenDialogErr(false);
          }}
          title={titlePopupError}
          content={contentPopupError}
        />
        {showBuyMoreResourceDialog && (
          <BuyMoreResourceDialog
            open={showBuyMoreResourceDialog}
            title={'Warning'}
            content={msg}
            onConfirm={() => router.push('/settings/credit-insight')}
            onCancel={() => setShowBuyMoreResourceDialog(false)}
          />
        )}

        {toasterComponent}

        {showCreateChatDialog && conversationId && (
          <ConfirmDialog
            type='confirm'
            title='Create New Chat'
            content='You are uploading new documents to be used in the chat. This will create a new chat with the selected documents. '
            onCancel={() => {
              setShowCreateChatDialog(false);
            }}
            onConfirm={() => {
              setChatThread([]);
              handleFileUpload(fileDocs ? fileDocs : []);
              setShowCreateChatDialog(false);
            }}
            textCancel='Cancel'
            textConfirm='Confirm'
            open={showCreateChatDialog}
          />
        )}
        {showAccessRestrictedDialog && trialHasEnded && (
          <ConfirmDialog
            open={trialHasEnded}
            title='Access Restricted'
            type='confirm'
            content='Your free trial has ended. Please subscribe to a plan to continue.'
            textCancel='Cancel'
            textConfirm='Choose Plan'
            onCancel={() => setShowAccessRestrictedDialog(false)}
            onConfirm={() => {
              router.push('/settings/billing-subscription');
              setShowAccessRestrictedDialog(false);
            }}
          />
        )}
      </div>
      {showErrDoesNotPermission && (
        <DialogErrorPermissionMagna
          open={showErrDoesNotPermission}
          onClose={() => {
            sttShowDialogErr.current = false;
            setShowErrDoesNotPermission(false);
            setError(undefined);
          }}
          onConfirm={() => {
            router.push('/settings/billing-subscription');
            setShowErrDoesNotPermission(false);
            setError(undefined);
          }}
        />
      )}
      {<MagnaMobileTabs linkDocs={linkDocs as FileDoc[]} />}
    </>
  );
};

LegalChatPage.displayName = 'LegalChatPage';

export default LegalChatPage;
