'use client';
import { ChatItemInterface } from '@/app/_components/conversation/chat/useChat';
import { Chat } from '@/app/api/__generated__/api';
import { ExtractionStatus } from '@/app/types/policy';
import { AxiosError } from 'axios';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

type ChatState = {
  chatThread: ChatItemInterface[];
  isInputDisabled: boolean;
  isNewConversation: boolean;
  createNewChatLoading: boolean;
  refreshChatLoading: boolean;
  triggerScrollToBottom: boolean;
  isOldChatFetchError: boolean;
  error?: AxiosError | undefined;
  hasHandledError?: boolean;
  conversationId: string | null;
  statusUploadDocument: ExtractionStatus | null;
  loadingTheReplacementFile: boolean;
  appendedChatSummary: boolean;
  stopGenerateAnswers: boolean;
  ignoreUpdateChatThread: boolean;
  documentIds: string[];
  isEmptyDocumentBeforeSubmitQuestion: boolean;
  isChangeDocumentIds: boolean;
  isAlreadyHasDocument: boolean;
  idsSharedSessionChat: string[];
  thinking: boolean;
};

type ChatActions = {
  setConversationId: (conversationId: string | null) => void;
  setChatThread: (chatThread: ChatItemInterface[]) => void;
  setIsInputDisabled: (isInputDisabled: boolean) => void;
  setIsNewConversation: (isNewConversation: boolean) => void;
  setCreateNewChatLoading: (createNewChatLoading: boolean) => void;
  setTriggerScrollToBottom: (triggerScrollToBottom: boolean) => void;
  setIsOldChatFetchError: (isOldChatFetchError: boolean) => void;
  setError: (error?: AxiosError) => void;
  setHasHandledError: (hasHandledError: boolean) => void;
  setRefreshChatLoading: (refreshChatLoading: boolean) => void;
  setStatusUploadDocument: (refreshChatLoading: ExtractionStatus | null) => void;
  setLoadingTheReplacementFile: (loadingTheReplacementFile: boolean) => void;
  setAppendedChatSummary: (appendedChatSummary: boolean) => void;
  updateChatThread: (chatItem: ChatItemInterface, likeStatus: boolean | null) => void;
  appendAnswerStreamById: (content: string | ChatItemInterface, currentQuestion?: Chat) => void;
  setStopGenerateAnswers: (stopGenerateAnswers: boolean) => void;
  appendAnswerRefreshLatestStreamById: (content: string | ChatItemInterface, id: string) => void;
  setIgnoreUpdateChatThread: (ignoreUpdateChatThread: boolean) => void;
  setDocumentIds: (dos: string[]) => void;
  setIsChangeDocumentIds: (stt: boolean) => void;
  setIsAlreadyHasDocument: (stt: boolean) => void;
  setIsEmptyDocumentBeforeSubmitQuestion: (stt: boolean) => void;
  setIdsSharedSessionChat: (idsSharedSessionChat: string[]) => void;
  setThinking: (tk: boolean) => void;
};

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  chatThread: [],
  isInputDisabled: false,
  isNewConversation: false,
  createNewChatLoading: false,
  triggerScrollToBottom: false,
  isOldChatFetchError: false,
  error: undefined,
  hasHandledError: false,
  refreshChatLoading: false,
  conversationId: '',
  statusUploadDocument: null,
  loadingTheReplacementFile: false,
  appendedChatSummary: false,
  stopGenerateAnswers: false,
  ignoreUpdateChatThread: false,
  documentIds: [],
  isChangeDocumentIds: false,
  isAlreadyHasDocument: false,
  isEmptyDocumentBeforeSubmitQuestion: false,
  idsSharedSessionChat: [],
  thinking: false,
  setConversationId: (conversationId) => set({ conversationId }),
  setHasHandledError: (hasHandledError) => set({ hasHandledError }),
  setChatThread: (chatThread) => set({ chatThread: chatThread }),
  setIsInputDisabled: (isInputDisabled) => set({ isInputDisabled }),
  setIsNewConversation: (isNewConversation) => set({ isNewConversation }),
  setCreateNewChatLoading: (createNewChatLoading) => set({ createNewChatLoading }),
  setTriggerScrollToBottom: (triggerScrollToBottom) => set({ triggerScrollToBottom }),
  setIsOldChatFetchError: (isOldChatFetchError) => set({ isOldChatFetchError }),
  setError: (error) => set({ error }),
  setRefreshChatLoading: (refreshChatLoading) => set({ refreshChatLoading }),
  setStatusUploadDocument: (statusUploadDocument) => set({ statusUploadDocument }),
  setLoadingTheReplacementFile: (loadingTheReplacementFile) => set({ loadingTheReplacementFile }),
  setAppendedChatSummary: (appendedChatSummary) => set({ appendedChatSummary }),
  updateChatThread: (chatItem: ChatItemInterface, likeStatus: boolean | null) => {
    try {
      const updatedChatThread = useChatStore.getState().chatThread.map((item) => {
        if (item.id === chatItem.response_to && item.answers?.length) {
          item.answers.forEach((answer) => {
            if (answer.id === chatItem.id) answer.liked = likeStatus;
          });
        }
        return item;
      });

      set({ chatThread: updatedChatThread });
    } catch (error) {
      console.log('error', error);
    }
  },

  appendAnswerStreamById: (content: string | ChatItemInterface, currentQuestion?: Chat) => {
    const tmpChatThread = [...useChatStore.getState().chatThread];
    if (currentQuestion) {
      console.log('tmpChatThread--->', tmpChatThread);
      tmpChatThread[tmpChatThread.length - 1] = { ...currentQuestion };
    }

    tmpChatThread[tmpChatThread.length - 1].answers = [
      typeof content === 'string' ? { id: uuidv4(), content, role: 'assistant' } : content,
    ];

    set({ chatThread: tmpChatThread });
  },
  setStopGenerateAnswers: (stopGenerateAnswers) => {
    set({ stopGenerateAnswers });
  },
  appendAnswerRefreshLatestStreamById: (content: string | ChatItemInterface, id: string) => {
    const tmpChatThread = [...useChatStore.getState().chatThread];
    const newTmpChatThread = [...tmpChatThread];
    const lastChatItem = tmpChatThread[tmpChatThread.length - 1];
    if (typeof content === 'string') {
      lastChatItem?.answers?.map((item) => {
        if (item.id === id) {
          item.content = content;
        }
        return item;
      });
    } else {
      if (lastChatItem.answers?.length) {
        lastChatItem.answers[lastChatItem.answers.length - 1] = content;
      }
    }
    newTmpChatThread[newTmpChatThread.length - 1] = lastChatItem;
    set({ chatThread: newTmpChatThread });
  },
  setIgnoreUpdateChatThread: (ignoreUpdateChatThread) => set({ ignoreUpdateChatThread }),
  setDocumentIds: (documentIds) => set({ documentIds }),
  setIsChangeDocumentIds: (isChangeDocumentIds) => set({ isChangeDocumentIds }),
  setIsAlreadyHasDocument: (isAlreadyHasDocument) => set({ isAlreadyHasDocument }),
  setIsEmptyDocumentBeforeSubmitQuestion: (isEmptyDocumentBeforeSubmitQuestion) =>
    set({ isEmptyDocumentBeforeSubmitQuestion }),
  setIdsSharedSessionChat: (idsSharedSessionChat) => set({ idsSharedSessionChat }),
  setThinking: (thinking) => set({ thinking }),
}));
