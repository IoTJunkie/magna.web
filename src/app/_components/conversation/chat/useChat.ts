'use client';
import { useChatStore } from '@/app/_components/conversation/chat/chat-store';
import { Chat, ChatSession, PageHighlight } from '@/app/api/__generated__/api';
import useCancelToken from '@/app/hooks/useCancelToken';
import createAxiosOptions from '@/app/utils/createAxiosOptions';
import { formattedChatThread } from '@/app/utils/formattedChatThread';
import {
  CHAT_SESSION_HISTORY_KEY,
  ChatItemRoles,
  LEGAL_HISTORY_QUERY_KEY,
  POLICY_HISTORY_QUERY_KEY,
} from '@/config';
import { useBookmarkContext } from '@/contexts/BookmarkContext';
import axios, { CancelTokenSource } from 'axios';
import { getSession } from 'next-auth/react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';

interface IUser {
  avatar_url: string;
  name: string;
  user_id: number;
  email: string;
}
export interface ChatItemInterface extends Chat {
  temporary?: boolean;
  isError?: boolean;
  typing?: boolean;
  answers?: ChatItemInterface[];
  user?: IUser;
}

function createErrorAnswer(error: any, latestQuestion: ChatItemInterface): ChatItemInterface {
  return {
    content: error?.message || '',
    role: ChatItemRoles.ASSISTANT,
    isError: true,
    response_to: String(latestQuestion.id) || null,
    typing: true,
  };
}
const regex = /data: (.*?)}/g;
const startStreamRegex = /event: stream-start/;
const endStreamRegex = /event: stream-end/;

export default function useChat() {
  const queryClient = useQueryClient();
  const { cancelToken } = useCancelToken();
  const { initBookmark } = useBookmarkContext();
  const router = useRouter();

  const PostCancelToken = useRef<CancelTokenSource | null>(null);

  const chatInputRef = useRef<any>(null);
  const temporaryId = useRef(uuidv4());
  const chatStreamingReferenceIdRef = useRef<string | null>(null);
  const contentRef = useRef<string | null>(null);
  const readerRef = useRef<any>(null);
  const [abort, setAbort] = useState<any>(null);

  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const policyId = pathname.startsWith('/policy-analyzer') && params.id ? params.id : undefined;
  const caseId = pathname.startsWith('/discovery-tool') && params.id ? params.id : undefined;
  const isDiscoveryPage = pathname.includes('discovery-tool');

  const [conversationId, setConversationId] = useQueryState(
    'c',
    parseAsString.withOptions({ shallow: true }),
  );
  const {
    error,
    hasHandledError,
    isNewConversation,
    chatThread,
    stopGenerateAnswers,
    ignoreUpdateChatThread,
    setChatThread,
    setIsInputDisabled,
    setTriggerScrollToBottom,
    setCreateNewChatLoading,
    setHasHandledError,
    setError,
    setIsNewConversation,
    setIsOldChatFetchError,
    setRefreshChatLoading,
    appendAnswerStreamById,
    setStopGenerateAnswers,
    appendAnswerRefreshLatestStreamById,
    setIgnoreUpdateChatThread,
    documentIds,
    setIsChangeDocumentIds,
    setIsEmptyDocumentBeforeSubmitQuestion,
    thinking,
    setThinking,
  } = useChatStore();

  const handleStopAnswers = async () => {
    try {
      const lastItemChat = chatThread[chatThread.length - 1];
      if (chatStreamingReferenceIdRef.current && contentRef.current && lastItemChat) {
        const session = await getSession();
        const payload = {
          ...(lastItemChat?.answers?.length === 1 ? { question: lastItemChat.content } : {}),
          answer: contentRef.current,
        };
        let params: any = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          body: JSON.stringify(payload),
        };
        const rs = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/chats/stream/${chatStreamingReferenceIdRef.current}`,
          params,
        );
        if (rs.ok) {
          if (ignoreUpdateChatThread) {
            setStopGenerateAnswers(false);
            setIgnoreUpdateChatThread(false);
            return;
          }
          // replace last item chat
          const response = await rs.json();
          const answer = response.find((item: Chat) => item?.role === ChatItemRoles.ASSISTANT);
          const newChatThread = [...chatThread];
          if (response.length > 1) {
            const question = response.find((item: Chat) => item.role === ChatItemRoles.USER);
            question.answers = [answer];
            newChatThread[newChatThread.length - 1] = {
              ...question,
            };
          } else {
            const answers = [...(lastItemChat?.answers || [])];
            answers[answers.length - 1] = answer;
            lastItemChat.answers = answers;
            newChatThread[newChatThread.length - 1] = {
              ...lastItemChat,
            };
          }
          setStopGenerateAnswers(false);
          setChatThread(newChatThread);
        }
      }
    } catch (error) {
    } finally {
      contentRef.current = null;
    }
  };

  useEffect(() => {
    if (stopGenerateAnswers && abort) {
      abort.abort();
      setAbort(null);
      readerRef.current?.cancel();
      handleStopAnswers();
      setStopGenerateAnswers(false);
    }
  }, [abort, stopGenerateAnswers]);

  const addToChatThread = useCallback(
    (chatItem: ChatItemInterface) => {
      setChatThread([...chatThread, chatItem]);

      setTriggerScrollToBottom(true);
    },
    [chatThread, setChatThread, setTriggerScrollToBottom],
  );

  const removeTemporaryChatItem = useCallback(() => {
    const updatedChatThread = chatThread.filter((chatItem) => chatItem.id !== temporaryId.current);
    setChatThread(updatedChatThread);
  }, [chatThread, setChatThread]);

  const fetchOldConversation = useCallback(async () => {
    removeTemporaryChatItem();
    try {
      const getOldConversationUrl = `/api/plg/chats/${conversationId}/session/`;
      const response = await axios.get(getOldConversationUrl, {
        // cancelToken,
      });

      // Init bookmarks
      const bookmarkedItems = response.data
        .filter((item: Chat) => item.bookmarked === true)
        .map((item: Chat) => ({
          name: item.bookmark_name,
          id: item.id,
        }));
      initBookmark(bookmarkedItems, conversationId);

      const formattedResponse = formattedChatThread(response.data);
      // Group chat answers by question
      setChatThread(formattedResponse);
      setIsOldChatFetchError(false);
    } catch (error) {
      console.log('error', error);
      setIsOldChatFetchError(true);
      // case sessionchat deleted
      router.push('/legal-chat');
    }
  }, [
    cancelToken,
    conversationId,
    initBookmark,
    removeTemporaryChatItem,
    setChatThread,
    setIsOldChatFetchError,
  ]);

  const oldConversationFetcher = useQuery(
    ['oldConversation', conversationId],
    fetchOldConversation,
    {
      enabled: false,
    },
  );

  const appendAnswer = useCallback(
    (chatItem: ChatItemInterface) => {
      const findChatITem = chatThread.find((item) => item.id === chatItem.response_to);

      if (findChatITem && findChatITem.answers) {
        const updatedChatItem = {
          ...findChatITem,
          answers: [...findChatITem.answers, chatItem],
        };

        const updatedChatThread = chatThread.map((item) =>
          item.id === chatItem.response_to ? updatedChatItem : item,
        );
        setChatThread(updatedChatThread);
        setTriggerScrollToBottom(true);
      }
    },
    [chatThread, setChatThread, setTriggerScrollToBottom],
  );

  const updateAnswer = useCallback(
    (chatItem: ChatItemInterface) => {
      const findChatITem = useChatStore
        .getState()
        .chatThread.find((item) => item.id === chatItem.response_to);

      if (findChatITem && findChatITem.answers) {
        const updatedChatItem = {
          ...findChatITem,
          answers: findChatITem.answers.map((item) => (item.id === chatItem.id ? chatItem : item)),
        };

        const updatedChatThread = chatThread.map((item) =>
          item.id === chatItem.response_to ? updatedChatItem : item,
        );
        setChatThread(updatedChatThread);
      }
    },
    [chatThread, setChatThread],
  );

  const fetchStreamAnswer = async (postQuestionUrl: string, session: any, body: any) => {
    let answer = '';
    const abortController = new AbortController();
    setAbort(abortController);

    try {
      const response = await fetch(postQuestionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify(body),
        signal: abortController.signal,
      });

      if (!response.body) {
        throw new Error(response.statusText);
      }

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();

      const read = async () => {
        try {
          const { done, value } = await reader.read();
          const chunk = decoder.decode(value, { stream: true });

          if (startStreamRegex.test(chunk)) {
            const data = chunk.split('event: stream-start');
            if (data.length && data[1].split('data: ')[1]) {
              const newAnswer = data[1].split('data: ')[1];
              chatStreamingReferenceIdRef.current = JSON.parse(newAnswer)?.chat_stream_ref_id;
              thinking && setThinking(false);
            }
          } else if (endStreamRegex.test(chunk)) {
            const data = chunk.split('event: stream-end');
            if (data.length && data[1].split('data: ')[1]) {
              const newAnswer = JSON.parse(data[1].split('data: ')[1]);
              const currentQuestion = newAnswer.filter((item: Chat) => item.role === 'user')[0];
              let answerTxt = newAnswer.filter((item: Chat) => item.role === 'assistant')[0];
              const highLighInfo = newAnswer.find((item: PageHighlight) => 'page_number' in item);

              const newAnswerText = {
                ...answerTxt,
                page_highlight: highLighInfo,
              };
              appendAnswerStreamById(newAnswerText, currentQuestion);
              return;
            }
          } else {
            const tmp = chunk.trim().replaceAll('data:', '').split('\n\n');
            if (tmp?.length) {
              tmp.forEach((item) => {
                const obj = JSON.parse(item);
                answer += obj.text;
              });
            }
            contentRef.current = answer;
            appendAnswerStreamById(answer);
          }

          await read();
        } catch (error) {
          console.error(error);
        }
      };

      await read();
    } catch (error: any) {
      console.error(error);
      setError(error);
    } finally {
      setCreateNewChatLoading(false);
      setIsInputDisabled(false);
    }
  };

  const postQuestion = useCallback(
    async (content: string, id?: string, useId?: boolean) => {
      const session = await getSession();
      const body = {
        role: ChatItemRoles.USER,
        content,
      };
      const postQuestionUrl = `${
        process.env.NEXT_PUBLIC_ENDPOINT_URL
      }/chats/v2/${useId ? id : conversationId || id}/chat/create/`;
      console.log('body---->', body);
      await fetchStreamAnswer(postQuestionUrl, session, body);
    },
    [conversationId, stopGenerateAnswers],
  );

  const prepareStateForSubmit = useCallback(() => {
    setCreateNewChatLoading(true);
    setIsInputDisabled(true);
    setError(undefined);
  }, [setCreateNewChatLoading, setIsInputDisabled, setError]);

  const submitQuestion = useCallback(
    async (content: string) => {
      temporaryId.current = uuidv4();

      PostCancelToken.current = axios.CancelToken.source();

      const chatItem: ChatItemInterface = {
        id: temporaryId.current,
        content,
        role: ChatItemRoles.USER,
        answers: [],
      };

      prepareStateForSubmit();
      addToChatThread(chatItem);

      try {
        // If conversationId is not set, create a new conversation
        if (!conversationId || (documentIds.length === 0 && isDiscoveryPage)) {
          const session = await getSession();
          const axiosOptions = createAxiosOptions({
            cancelToken,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.user?.access_token}`,
            },
          });

          setIsNewConversation(true);
          const createNewConversationUrl = caseId
            ? `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/chats/session/discovery/`
            : '/api/plg/chats/session/create/';
          const body: {
            policy?: string | null;
            name?: string;
            case?: string;
            document_ids?: string[];
          } = {
            name: content || '',
          };

          if (policyId) {
            body['policy'] = String(policyId) || null;
          }

          if (caseId) {
            // const res = await axios.get(
            //   `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases/${caseId}`,
            //   {
            //     method: 'GET',
            //     headers: {
            //       'Content-Type': 'application/json',
            //       Authorization: `Bearer ${session?.user?.access_token}`,
            //     },
            //   },
            // );
            // console.log('res--->', res);
            // const documents_ids = res.data.documents.map((document: any) => document.id);
            // body['document_ids'] = documents_ids;

            body['document_ids'] = documentIds;
            body['case'] = String(caseId);
          }

          const response = await axios.post<ChatSession>(
            createNewConversationUrl,
            body,
            axiosOptions,
          );

          console.log('chat session---->', response);
          if (response.data.id) {
            // Refetch conversation histories in sidebar
            if (pathname.startsWith('/legal-chat')) {
              queryClient.invalidateQueries(LEGAL_HISTORY_QUERY_KEY);
            }
            if (pathname.startsWith('/policy-analyzer') && policyId) {
              queryClient.invalidateQueries([POLICY_HISTORY_QUERY_KEY, policyId]);
            }
            if (pathname.startsWith('/discovery-tool') && caseId) {
              queryClient.invalidateQueries([CHAT_SESSION_HISTORY_KEY, caseId]);
            }
            setConversationId(response.data.id);
            await postQuestion(content, response.data.id);
          }
        }

        if (conversationId) {
          await postQuestion(content);
        }
      } catch (error: any) {
        if (axios.isCancel(error)) {
          removeTemporaryChatItem();
        } else {
          if (error) {
            console.log('error', error);
            setHasHandledError(false);
            setError(error);
            setCreateNewChatLoading(false);
            setIsInputDisabled(false);
          }
        }
      } finally {
        // setCreateNewChatLoading(false);
        // setIsInputDisabled(false);
      }
    },
    [
      addToChatThread,
      cancelToken,
      conversationId,
      pathname,
      policyId,
      postQuestion,
      prepareStateForSubmit,
      queryClient,
      removeTemporaryChatItem,
      setConversationId,
      // setCreateNewChatLoading,
      setError,
      setHasHandledError,
      // setIsInputDisabled,
      setIsNewConversation,
      documentIds,
    ],
  );

  const onSubmit = useCallback(() => {
    // locally store input value from chat-window-message
    const inputValue = chatInputRef.current?.getValue();

    // clear input value
    chatInputRef.current?.clearValue();
    if (isDiscoveryPage) {
      setIsEmptyDocumentBeforeSubmitQuestion(documentIds.length === 0);
    }
    submitQuestion(inputValue);
  }, [submitQuestion]);

  const refreshAnswer = useCallback(async () => {
    PostCancelToken.current = axios.CancelToken.source();
    const abortController = new AbortController();
    setAbort(abortController);
    const session = await getSession();
    let answer = '';

    try {
      setRefreshChatLoading(true);
      setIsInputDisabled(true);

      // Get latest question from chatThread
      const latestQuestion = chatThread[chatThread.length - 1];

      if (latestQuestion.id === temporaryId.current) {
        await submitQuestion(latestQuestion.content);
        return;
      }

      const newAnswer: ChatItemInterface = {
        content: '',
        role: ChatItemRoles.ASSISTANT,
        response_to: String(latestQuestion.id) || null,
        temporary: true,
      };

      appendAnswer(newAnswer);

      const refreshUrl = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/chats/v2/${conversationId}/chat/refresh-latest-response/`;

      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const reader = response.body!.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      const idNewAnswer = uuidv4();
      const newChatThread = [...chatThread];
      newChatThread[newChatThread.length - 1].answers?.push({
        id: idNewAnswer,
        content: '',
        role: 'assistant',
      });
      setChatThread(newChatThread);

      const read = async (): Promise<void> => {
        const { value } = await reader.read();

        const chunk = decoder.decode(value, { stream: true });

        if (startStreamRegex.test(chunk)) {
          const data = chunk.split('event: stream-start');
          if (data.length && data[1].split('data: ')[1]) {
            const newAnswer = data[1].split('data: ')[1];
            chatStreamingReferenceIdRef.current = JSON.parse(newAnswer)?.chat_stream_ref_id;
            thinking && setThinking(false);
          }
        } else if (endStreamRegex.test(chunk)) {
          const data = chunk.split('event: stream-end');
          if (data.length && data[1].split('data: ')[1]) {
            const newAnswer = data[1].split('data: ')[1];

            const item = JSON.parse(newAnswer);
            const highLighInfo = item.find((item: PageHighlight) => 'page_number' in item);

            const newAnswerText = {
              ...item[0],
              page_highlight: highLighInfo,
            };
            appendAnswerRefreshLatestStreamById(newAnswerText, idNewAnswer);
          }
        } else {
          const tmp = chunk.trim().replaceAll('data:', '').split('\n\n');
          if (tmp?.length) {
            tmp.forEach((item) => {
              const obj = JSON.parse(item);
              answer += obj.text;
            });
          }
          contentRef.current = answer;
          appendAnswerRefreshLatestStreamById(answer, idNewAnswer);
        }
        return read();
      };

      await read();
    } catch (error: any) {
      if (axios.isCancel(error)) {
        removeTemporaryChatItem();
        return;
      }
      setHasHandledError(false);
      setError(error);
    } finally {
      setIsInputDisabled(false);
      setRefreshChatLoading(false);
    }
  }, [
    appendAnswer,
    chatThread,
    conversationId,
    removeTemporaryChatItem,
    setChatThread,
    setError,
    setHasHandledError,
    setIsInputDisabled,
    setRefreshChatLoading,
    submitQuestion,
    appendAnswerRefreshLatestStreamById,
  ]);

  const refreshAnswerFetcher = useQuery(['refreshAnswer', conversationId], refreshAnswer, {
    enabled: false,
  });

  const onRefreshAnswer = useCallback(() => {
    refreshAnswerFetcher.refetch();
  }, [refreshAnswerFetcher]);

  useEffect(() => {
    if (!conversationId) {
      setChatThread([]);
      return;
    }
    if (isNewConversation) {
      setIsNewConversation(false);
      return;
    }

    if (searchParams.get('c')) {
      oldConversationFetcher.refetch();
    }

    return () => {
      PostCancelToken?.current?.cancel('Operation canceled by the user.');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, pathname, searchParams]);

  // Handle error
  const handleError = useCallback(() => {
    const latestQuestion = chatThread[chatThread.length - 1];

    if (latestQuestion?.answers && latestQuestion?.answers.length > 0) {
      updateAnswer(createErrorAnswer(error, latestQuestion));
    }

    if (!latestQuestion.answers || latestQuestion.answers.length <= 0) {
      appendAnswer(createErrorAnswer(error, latestQuestion));
    }

    setHasHandledError(true);
  }, [appendAnswer, chatThread, error, updateAnswer, setHasHandledError]);

  useEffect(() => {
    if (error && !hasHandledError) {
      handleError();
    }
  }, [error, hasHandledError, handleError]);

  const stopPostQuestion = useCallback(() => {
    if (conversationId) {
      setStopGenerateAnswers(true);
    }
    setCreateNewChatLoading(false);
    setIsInputDisabled(false);
  }, [setCreateNewChatLoading, setIsInputDisabled, setStopGenerateAnswers, conversationId]);

  const appendTextChat = async (text: string) => {
    await submitQuestion(text);
  };

  const onUpdateChatThread = (chatItem: ChatItemInterface, likeStatus: boolean | null) => {
    try {
      const updatedChatThread = chatThread.map((item) => {
        if (item.id === chatItem.response_to && item.answers?.length) {
          item.answers.forEach((answer) => {
            if (answer.id === chatItem.id) answer.liked = likeStatus;
          });
        }
        return item;
      });
      setChatThread(updatedChatThread);
    } catch (error) {
      console.log('error', error);
    }
  };

  const createNewConversationDiscovery = async (value: string) => {
    const createNewConversationUrl = '/api/plg/chats/session/discovery/';
    const body = {
      case: params.id,
      document_ids: documentIds,
      name: value,
    };

    const response = await axios.post<ChatSession>(createNewConversationUrl, body);
    if (response.data.id) {
      setChatThread([]);
      setConversationId(response.data.id);
      setTimeout(async () => {
        temporaryId.current = uuidv4();

        PostCancelToken.current = axios.CancelToken.source();

        const chatItem: ChatItemInterface = {
          id: temporaryId.current,
          content: value,
          role: ChatItemRoles.USER,
          answers: [],
        };
        prepareStateForSubmit();
        await setChatThread([chatItem]);
        await postQuestion(value, response.data.id, true);
        if (pathname.startsWith('/discovery-tool')) {
          queryClient.invalidateQueries([CHAT_SESSION_HISTORY_KEY]);
        }
        setIsChangeDocumentIds(false);
      }, 1500);
    }
  };

  return {
    chatInputRef,
    onSubmit,
    onRefreshAnswer,
    refreshAnswerFetcher,
    oldConversationFetcher,
    stopPostQuestion,
    appendTextChat,
    onUpdateChatThread,
    createNewConversationDiscovery,
  };
}
