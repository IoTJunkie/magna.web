import RecommendQuestions from '@/app/_components/conversation/recommend-questions';
import { fileTypeAllowUpload } from '@/app/constant';
import useToastComponent from '@/app/hooks/Toast';
import useSettingsProfile from '@/app/settings/profile/useSettingsProfile';
import { IResource, IResourceLeftChecking } from '@/app/types/creditInsight';
import { ExtractionStatus } from '@/app/types/policy';
import { isTrialEnded } from '@/app/utils/checkTrialEnded';
import { IMAGE_TYPE_ALLOWED } from '@/config';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Tooltip,
} from '@fluentui/react-components';
import { QuestionCircle24Regular, RecordStop24Regular } from '@fluentui/react-icons';
import classNames from 'classnames';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import BuyMoreResourceDialog from '../../common/BuyMoreResourceDialog';
import ConfirmDialog from '../../common/ConfirmDialog';
import CustomIcon from '../../common/CustomIcon';
import DialogError from '../../common/DialogError';
import { useProfileStore } from '../../profile/profile-store';
import { useChatStore } from '../chat/chat-store';
import useChat from '../chat/useChat';
import useUploadDocument from '../chat/useUploadDocument';
import UploadDocsMagna from './components/UploadDocsMagna';
import DialogErrorPermissionMagna from './components/DialogErrorPermissionMagna';

interface ChatInputProps extends React.HtmlHTMLAttributes<HTMLFormElement> {
  disabled?: boolean;
  onSubmit: () => void;
  placeholder?: string | undefined;
  showRecommendQuestions?: boolean;
  copiedQuestion?: string;
  stopPostQuestion?: () => void;
  createNewChatLoading?: boolean;
  refreshChatLoading?: boolean;
  isEnoughStorage: (resource: IResource, totalFileSize: number) => IResourceLeftChecking;
  isReadOnlySessionChat: boolean;
}
const validFileTypes = fileTypeAllowUpload.join(', ');

const ChatInput: React.FC<ChatInputProps> = forwardRef((props, ref) => {
  const {
    onSubmit,
    disabled,
    placeholder,
    showRecommendQuestions,
    copiedQuestion,
    stopPostQuestion,
    createNewChatLoading,
    refreshChatLoading,
    isEnoughStorage,
    isReadOnlySessionChat,
  } = props;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>('');
  const [isFocused, setFocused] = useState<boolean>(false);
  const [msg, setMsg] = useState<JSX.Element | string>('');
  const [showDialogCheckNewChatDiscovery, setShowDialogCheckNewChatDiscovery] = useState(false);
  const [showBuyMoreResourceDialog, setShowBuyMoreResourceDialog] = useState(false);
  const [showDialogInsufficientCredits, setShowDialogInsufficientCredits] = useState(false);
  const [showAccessRestrictedDialog, setShowAccessRestrictedDialog] = useState<boolean>(false);
  const [showDialogUploadDocs, setShowDialogUploadDocs] = useState(false);
  const {
    statusUploadDocument,
    setStatusUploadDocument,
    setLoadingTheReplacementFile,
    isAlreadyHasDocument,
    isChangeDocumentIds,
    documentIds,
  } = useChatStore();
  const { profileInfo, documentSizeLimit } = useProfileStore();
  const { resourceInfo } = useProfileStore();
  const { createNewConversationDiscovery } = useChat();
  const uploadDocsProcessing = statusUploadDocument === ExtractionStatus.PROCESSING;
  const [conversationId] = useQueryState('c', parseAsString);
  const [showErrDoesNotPermission, setShowErrDoesNotPermission] = useState(false);
  const { showToast, setIntent, toasterComponent } = useToastComponent({
    content: msg,
  });
  const pathname = usePathname();
  const legalChat = pathname.startsWith('/legal-chat');
  const discoveryChat = pathname.startsWith('/discovery-tool');
  const router = useRouter();
  const trialHasEnded =
    isTrialEnded(profileInfo?.current_subscription?.trial_period_end as string) &&
    profileInfo?.current_subscription?.price_plan === null;
  const handleShowErr = (msg: string) => {
    setIntent('error');
    setMsg(msg);
    showToast();
  };

  const { onSubmitFile, uploadInputRef, modalUploadFailed, setModalUploadFailed } =
    useUploadDocument(handleShowErr);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  useEffect(() => {
    if (copiedQuestion) {
      setText(copiedQuestion);
      inputRef.current?.focus();
    }
  }, [copiedQuestion]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '0px';
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = scrollHeight + 'px';
    }
  }, [text]);

  useEffect(() => {
    // clear input, file when change conversation
    setText('');
    uploadInputRef.current.value = '';
  }, [conversationId, uploadInputRef]);

  const checkSttCreateNewSessionDiscovery = () => {
    if (isChangeDocumentIds && conversationId && discoveryChat && documentIds.length > 0) {
      setShowDialogCheckNewChatDiscovery(true);
      return false;
    }
    return true;
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();

        if (trialHasEnded) {
          setShowAccessRestrictedDialog(true);
          return;
        }

        const check = checkSttCreateNewSessionDiscovery();
        if (!check) return;
        const trimmedText = text.trim();
        if (trimmedText === '') {
          setText('');
          return;
        }
        onSubmit();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSubmit, text],
  );

  const handleOnSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (trialHasEnded) {
        setShowAccessRestrictedDialog(true);
        return;
      }
      if (profileInfo?.current_subscription === null) {
        setShowErrDoesNotPermission(true);
        return;
      }
      const check = checkSttCreateNewSessionDiscovery();
      if (!check) return;
      const trimmedText = text.trim();
      if (trimmedText === '') {
        setText('');
        return;
      }
      onSubmit();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSubmit, text],
  );

  const clearValue = useCallback(() => {
    setText('');
  }, []);

  const getValue = useCallback(() => {
    return text.trim();
  }, [text]);

  const setFocus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const setValue = useCallback((value: string) => {
    setText(value);
  }, []);

  useImperativeHandle(ref, () => ({
    clearValue,
    getValue,
    setFocus,
    setValue,
  }));

  const handelFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handelBlur = useCallback(() => {
    setFocused(false);
  }, []);

  const handleRecommendQuestionClick = useCallback(
    async (question: string) => {
      if (trialHasEnded) {
        setShowAccessRestrictedDialog(true);
        return;
      }

      if (profileInfo?.current_subscription === null) {
        setShowErrDoesNotPermission(true);
        return;
      }
      await setValue(question); // make sure input value is set before submit
      setFocus();

      onSubmit();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSubmit, setFocus, setValue],
  );

  const checkStorageLeft = (size: number) => {
    if (resourceInfo && !isEnoughStorage(resourceInfo, size).isEnough) {
      setShowBuyMoreResourceDialog(true);
      return true;
    }
    return false;
  };

  const handleFileUpload = async (uploadfiles: any[]) => {
    if (trialHasEnded) {
      setShowAccessRestrictedDialog(true);
      return;
    }

    if (uploadfiles) {
      const files = Array.from(uploadfiles);
      // validate file

      const allowedFileTypes = validFileTypes.split(',').map((type) => type.trim());

      const filesType = files.map((file) => `.${file?.name.split('.').pop()}`);
      if (!filesType.every((type) => allowedFileTypes.includes(type.toLowerCase()))) {
        handleShowErr('Invalid File Format, please upload a PDF, DOC, DOCX or image file.');
        return;
      }
      const fileSizeMB = files.reduce((acc, curr) => curr.size + acc, 0) / (1024 * 1024);
      if (checkStorageLeft(fileSizeMB)) {
        return;
      }
      if (fileSizeMB > documentSizeLimit) {
        handleShowErr('The file size exceeds the limit. Please upload a smaller file.');
        return;
      }
      onSubmitFile(isAlreadyHasDocument);
    }
  };

  const handleCreateNewChatMagna = () => {
    if (trialHasEnded) {
      setShowAccessRestrictedDialog(true);
      return;
    }
  };

  const handleCreateNewChatDiscovery = () => {
    setShowDialogCheckNewChatDiscovery(false);
    createNewConversationDiscovery(inputRef?.current?.value || '');
  };

  const handleUploadFileNewChat = () => {
    if (conversationId && isAlreadyHasDocument) {
      handleCreateNewChatMagna();
    } else {
      handleFileUpload(uploadInputRef.current.files);
    }
  };

  const handleBuyMoreCredits = () => {};

  return (
    <div className='mx-auto mb-1 flex shrink flex-row gap-3 md:mx-4'>
      <form
        onSubmit={handleOnSubmit}
        className='max-w-chat-layout relative mx-auto flex h-full flex-1 flex-col px-5 xl:px-0'
      >
        {showRecommendQuestions && <RecommendQuestions {...{ handleRecommendQuestionClick }} />}

        <div className='flex w-full items-center justify-between gap-4'>
          <textarea
            className={classNames(
              'chat-input max-h-48 flex-1 resize-none rounded-xl bg-color-screen-bg p-4 px-3 text-base ring-1 ring-neutrual-50 placeholder:text-base placeholder:text-text-support focus:border-none focus-visible:border-none focus-visible:outline-none',
              {
                'cursor-not-allowed disabled:opacity-75': disabled || isReadOnlySessionChat,
                'ring-1 !ring-aero-7': isFocused,
              },
            )}
            {...{
              tabIndex: 0,
              rows: 1,
              value: text,
              ref: inputRef,
              name: 'chat-input',
              placeholder,
              onChange: handleChange,
              onKeyDown: handleKeyDown,
              disabled: disabled || isReadOnlySessionChat,
              onFocus: handelFocus,
              onBlur: handelBlur,
            }}
          />
          {legalChat && (
            <div
              className={classNames(
                'upload-file relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-xl border border-color-screen-stroke',
                {
                  '!cursor-not-allowed opacity-50': uploadDocsProcessing || isReadOnlySessionChat,
                  'cursor-pointer': !uploadDocsProcessing,
                },
              )}
              onClick={() => {
                !uploadDocsProcessing && !isReadOnlySessionChat && setShowDialogUploadDocs(true);
              }}
            >
              <div className='aspect-w-1 aspect-h-1 relative size-6'>
                <CustomIcon name='upload-file' />
              </div>
            </div>
          )}
          {/* {legalChat &&
            planName !== PlansName.Esquire && ( // plan allow get from BE
              <label htmlFor='file'>
                <div
                  className={classNames(
                    'relative flex h-14 w-14 items-center justify-center rounded-xl border border-color-screen-stroke',
                    {
                      'cursor-not-allowed opacity-50': uploadDocsProcessing,
                      'cursor-pointer': !uploadDocsProcessing,
                    },
                  )}
                >
                  <div className='aspect-w-1 aspect-h-1 relative size-6'>
                    <CustomIcon name='upload-file' />
                  </div>
                </div>
              </label>
            )} */}
          {/* {legalChat && planName === PlansName.Esquire && ( */}
          {/* sigle upload file docs */}
          <input
            type='file'
            id='file'
            accept={validFileTypes}
            onChange={() => {
              handleUploadFileNewChat();
            }}
            className='hidden'
            ref={uploadInputRef}
            disabled={uploadDocsProcessing}
            multiple
          />
          {!createNewChatLoading && !refreshChatLoading ? (
            <button
              type='submit'
              className={classNames(
                'relative flex h-14 w-14 shrink items-center justify-center rounded-xl bg-aero-7',
                {
                  'cursor-not-allowed disabled:opacity-75':
                    disabled || text.trim() === '' || isReadOnlySessionChat,
                },
              )}
              disabled={disabled || text.trim() === '' || isReadOnlySessionChat}
            >
              <div className='aspect-w-1 aspect-h-1 relative z-10 size-6'>
                <Image src='/svg/send-icon.svg' priority fill alt='' />
              </div>
            </button>
          ) : (
            <button
              type='submit'
              className={classNames(
                'relative flex h-14 w-14 shrink items-center justify-center rounded-xl bg-danger',
              )}
              onClick={stopPostQuestion}
            >
              <div className='aspect-w-1 aspect-h-1 relative z-10 size-6'>
                <RecordStop24Regular className='size-6 text-white-5' />
              </div>
            </button>
          )}
        </div>

        <div className='flex justify-center'>
          <p className='mt-4 text-center text-xs text-text-support'>
            Magna AI is not a lawyer and is not a substitute for legal advice from a licensed
            attorney...
            <Tooltip
              content='Magna AI is not a lawyer and is not a substitute for legal advice from a licensed
          attorney. The information provided by Magna AI is for general informational purposes
          only and may not be accurate, complete, or current. You should not rely on Magna AI
          for any legal decisions or actions, and we strongly recommend consulting with a qualified
          attorney for advice on specific legal issues.'
              relationship='label'
              {...props}
            >
              <Button size='small' appearance='transparent'>
                <QuestionCircle24Regular className='size-4 text-text-support' />
              </Button>
            </Tooltip>
          </p>
        </div>
      </form>
      <Dialog open={showDialogCheckNewChatDiscovery} modalType='alert'>
        <DialogSurface className='w-[40rem] sm:w-[50%] md:min-w-[26.25rem]'>
          <DialogBody>
            <DialogTitle className='!text-lg !font-semibold'>Create new chat</DialogTitle>
            <DialogContent className='!text-support'>
              You are changing the number of documents used in the chat. This will create a new chat
              with the selected documents.
            </DialogContent>
            <DialogActions>
              <>
                <DialogTrigger disableButtonEnhancement>
                  <Button
                    className='!border-aero-10 !text-base !font-semibold'
                    size='large'
                    onClick={() => setShowDialogCheckNewChatDiscovery(false)}
                  >
                    Cancel
                  </Button>
                </DialogTrigger>
                <DialogTrigger disableButtonEnhancement>
                  <Button
                    className='!bg-aero-7 !text-base !font-semibold !text-confirm'
                    size='large'
                    onClick={handleCreateNewChatDiscovery}
                  >
                    Create new chat
                  </Button>
                </DialogTrigger>
              </>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <DialogError
        open={modalUploadFailed}
        setOpen={setModalUploadFailed}
        onClose={() => {
          setModalUploadFailed(false);
          setStatusUploadDocument(null);
          setLoadingTheReplacementFile(false);
          uploadInputRef.current.value = '';
        }}
        title='Upload failed'
        content='An error occurred during document processing. Please try again.'
      />
      {/* <DialogError
        open={modalNotAllowUploadDocs}
        setOpen={setModalNotAllowUploadDocs}
        onClose={() => {
          setModalNotAllowUploadDocs(false);
        }}
        title='Error!'
        content='This session already contains a document. To upload another document, kindly initiate a new chat session'
      /> */}
      {showBuyMoreResourceDialog && (
        <BuyMoreResourceDialog
          open={showBuyMoreResourceDialog}
          title={'Warning'}
          onConfirm={() => router.push('/settings/credit-insight')}
          onCancel={() => setShowBuyMoreResourceDialog(false)}
        />
      )}

      {/* {showCreateChatDialog && conversationId && (
        <ConfirmDialog
          type='confirm'
          title='Create New Chat'
          content='You are uploading new documents to be used in the chat. This will create a new chat with the selected documents. '
          onCancel={() => {
            setShowCreateChatDialog(false);
            uploadInputRef.current.value = '';
          }}
          onConfirm={() => {
            setChatThread([]);
            handleFileUpload(uploadInputRef.current.files);
          }}
          textCancel='Cancel'
          textConfirm='Confirm'
          open={showCreateChatDialog}
        />
      )} */}

      {showDialogInsufficientCredits && (
        <ConfirmDialog
          open={showDialogInsufficientCredits}
          title='Insufficient Credits'
          content='You have used all of your credits. Please buy more to continue usage.'
          textConfirm='Buy More'
          onCancel={() => {
            setShowDialogInsufficientCredits(false);
          }}
          onConfirm={handleBuyMoreCredits}
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
      <UploadDocsMagna
        showDialogUploadDocs={showDialogUploadDocs}
        setShowDialogUploadDocs={setShowDialogUploadDocs}
      />
      {toasterComponent}
    </div>
  );
});

export default ChatInput;

ChatInput.displayName = 'ChatInput';
