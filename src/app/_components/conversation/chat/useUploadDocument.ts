'use client';
import { Chat } from '@/app/api/__generated__/api';
import useCancelToken from '@/app/hooks/useCancelToken';
import { FileDoc } from '@/app/types/fileDoc';
import { ExtractionStatus } from '@/app/types/policy';
import { LEGAL_HISTORY_QUERY_KEY } from '@/config';
import axios, { CancelTokenSource } from 'axios';
import { getSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useChatStore } from './chat-store';
import { useProfileStore } from '@/app/_components/profile/profile-store';

export interface ChatItemInterface extends Chat {
  temporary?: boolean;
  isError?: boolean;
  typing?: boolean;
  answers?: ChatItemInterface[];
}

export default function useUploadDocument(handleShowError?: Function) {
  const { cancelToken } = useCancelToken();
  const PostCancelToken = useRef<CancelTokenSource | null>(null);
  const uploadInputRef = useRef<any>(null);
  const refFileDocs = useRef<any>(null);
  const [modalUploadFailed, setModalUploadFailed] = useState<boolean>(false);
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { setStatusUploadDocument, setLoadingTheReplacementFile, setAppendedChatSummary } =
    useChatStore();
  const { profileInfo } = useProfileStore();
  const [conversationId, setConversationId] = useQueryState('c', parseAsString);

  const uploadFileExistingConversation = useCallback(async () => {
    if (refFileDocs.current) {
      setStatusUploadDocument(ExtractionStatus.PROCESSING);
      setLoadingTheReplacementFile(true);
      try {
        const session = await getSession();
        // const formData = new FormData();
        // formData.append('file', refFileDocs.current);
        const formData = new FormData();
        // formData.append('file', refFileDocs.current);
        Array.from(refFileDocs.current).forEach((_, index) => {
          formData.append('files', refFileDocs.current[index]);
        });
        // formData.append('name', '');
        let params: any = {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          body: formData,
        };
        const rs = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/chats/session/${conversationId}/update`,
          params,
        );
        if (rs.ok) {
          setAppendedChatSummary(true);
        } else {
          setModalUploadFailed(true);
          setStatusUploadDocument(ExtractionStatus.ERROR);
        }
      } catch (error) {
        console.log('error', error);
        setModalUploadFailed(true);
      } finally {
        setLoadingTheReplacementFile(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const submitUploadFile = useCallback(async () => {
    PostCancelToken.current = axios.CancelToken.source();

    try {
      const session = await getSession();
      // If conversationId is not set, create a new conversation
      if (refFileDocs.current) {
        setStatusUploadDocument(ExtractionStatus.PROCESSING);
        const formData = new FormData();
        // formData.append('file', refFileDocs.current);
        Array.from(refFileDocs.current).forEach((_, index) => {
          formData.append('files', refFileDocs.current[index]);
        });
        formData.append('name', refFileDocs.current[0]?.name || '');
        let params: any = {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          body: formData,
        };
        const rs = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/chats/session/create/`,
          params,
        );
        if (rs.ok) {
          const data = await rs.json();
          if (data?.id) {
            setConversationId(data.id);
            setAppendedChatSummary(true);
            // Refetch conversation histories in sidebar
            if (pathname.startsWith('/legal-chat')) {
              queryClient.invalidateQueries(LEGAL_HISTORY_QUERY_KEY);
            }
          }
        } else {
          const res = await rs.json();
          if (res.detail && handleShowError) {
            handleShowError(res.detail);
            setStatusUploadDocument(ExtractionStatus.ERROR);
          } else {
            setModalUploadFailed(true);
            setStatusUploadDocument(ExtractionStatus.ERROR);
          }
        }
      }
    } catch (error: any) {
      console.log('error', error);
      setModalUploadFailed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelToken, conversationId, uploadFileExistingConversation, pathname]);

  const onSubmitFile = (isAlreadyHasDoc?: boolean, val?: FileDoc[]) => {
    const files = val ? val : uploadInputRef.current.files ?? null;
    if (files) {
      refFileDocs.current = files;
      if (conversationId && !isAlreadyHasDoc) {
        uploadFileExistingConversation();
      } else {
        submitUploadFile();
      }
    }
  };

  const uploadDocsExistingConversation = useCallback(async () => {
    if (refFileDocs.current) {
      refFileDocs.current.append('session_id', conversationId);
      setStatusUploadDocument(ExtractionStatus.PROCESSING);
      setLoadingTheReplacementFile(true);
      try {
        const session = await getSession();
        let params: any = {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          body: refFileDocs.current,
        };
        const rs = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_MEDIA}/magna_text_extraction`,
          params,
        );
        if (rs.ok) {
          setAppendedChatSummary(true);
        } else {
          setModalUploadFailed(true);
          setStatusUploadDocument(ExtractionStatus.ERROR);
        }
      } catch (error) {
        console.log('error', error);
        setModalUploadFailed(true);
      } finally {
        setLoadingTheReplacementFile(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const submitUploadDocs = useCallback(
    async (func?: (msg?: string) => void) => {
      PostCancelToken.current = axios.CancelToken.source();

      try {
        const session = await getSession();
        // If conversationId is not set, create a new conversation
        if (refFileDocs.current) {
          setStatusUploadDocument(ExtractionStatus.PROCESSING);

          let params: any = {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session?.user?.access_token}`,
            },
            body: refFileDocs.current,
          };
          const rs = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_MEDIA}/magna_text_extraction`,
            params,
          );
          if (rs.ok && profileInfo?.current_subscription !== null) {
            const data = await rs.json();
            if (data?.tasks && data.tasks.length > 0) {
              const ssId = data.tasks[0].session_id;
              setConversationId(ssId);
              setAppendedChatSummary(true);
              // Refetch conversation histories in sidebar
              if (pathname.startsWith('/legal-chat')) {
                queryClient.invalidateQueries(LEGAL_HISTORY_QUERY_KEY);
              }
            }
          } else if (rs.ok && profileInfo?.current_subscription === null) {
            func && func();
          } else {
            const res = await rs.json();
            if (res.detail && func) {
              func(res.detail);
            }
            if (res.detail && handleShowError) {
              handleShowError(res.detail);
              setStatusUploadDocument(ExtractionStatus.ERROR);
            } else {
              setModalUploadFailed(true);
              setStatusUploadDocument(ExtractionStatus.ERROR);
            }
          }
        }
      } catch (error: any) {
        console.log('error', error);
        setModalUploadFailed(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [cancelToken, conversationId, uploadFileExistingConversation, pathname],
  );

  const onSubmitUploadDocsMagna = useCallback(
    (isAlreadyHasDoc: boolean, val: FormData, func?: (msg?: string) => void) => {
      refFileDocs.current = val;
      if (conversationId && !isAlreadyHasDoc) {
        uploadDocsExistingConversation();
      } else {
        submitUploadDocs(func);
      }
    },
    [conversationId, submitUploadDocs, uploadDocsExistingConversation],
  );

  return {
    onSubmitFile,
    uploadInputRef,
    modalUploadFailed,
    setModalUploadFailed,
    onSubmitUploadDocsMagna,
  };
}
