'use client';
import ChatInput from '@/app/_components/conversation/chat-input';
import ChatThread from '@/app/_components/conversation/chat-thread';
import { useChatStore } from '@/app/_components/conversation/chat/chat-store';
import useChat from '@/app/_components/conversation/chat/useChat';
import { parseAsString, useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';
import { useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/navigation';
import { RESOURCE_PROFILE } from '@/config';
import { IResource } from '@/app/types/creditInsight';
import { isEnoughStorage } from '@/app/utils/checkResourceLeft';
import BuyMoreResourceDialog from '../../common/BuyMoreResourceDialog';

type Props = {
  emptyChatComponent?: React.ReactNode;
};

const Chat = ({ emptyChatComponent }: Props) => {
  const [isSmallHeight, setIsSmallHeight] = useState(false);
  const [conversationId] = useQueryState('c', parseAsString);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useQuery<IResource>([RESOURCE_PROFILE]);
  const router = useRouter();
  const windowSize = useWindowSize();
  const [isReadOnlySessionChat, setIsReadOnlySessionChat] = useState(false);

  const {
    chatThread,
    createNewChatLoading,
    isInputDisabled,
    triggerScrollToBottom,
    refreshChatLoading,
    idsSharedSessionChat,
    setThinking,
  } = useChatStore();

  const { chatInputRef, onSubmit, onRefreshAnswer, oldConversationFetcher, stopPostQuestion } =
    useChat();

  const [copiedQuestion, setCopiedQuestion] = useState('');

  const onStopPostQuestion = () => {
    setThinking(false);
    stopPostQuestion();
    setCopiedQuestion('');
  };

  const copyQuestion = (question: string) => {
    setCopiedQuestion(question);
  };

  const onSubmitQuestion = () => {
    queryClient.invalidateQueries([RESOURCE_PROFILE]);
    if (data) {
      setThinking(true);
      onSubmit();
      setCopiedQuestion('');
    } else {
      setShow(true);
    }
  };

  const handleBuyMoreResource = () => {
    setIsLoading(true);
    router.push('/settings/credit-insight');
  };

  useEffect(() => {
    if (conversationId) {
      setIsReadOnlySessionChat(idsSharedSessionChat.includes(conversationId));
    } else {
      setIsReadOnlySessionChat(false);
    }
  }, [idsSharedSessionChat, conversationId]);

  useEffect(() => {
    if (windowSize.height < 600) {
      setIsSmallHeight(true);
    } else {
      setIsSmallHeight(false);
    }
  }, [windowSize]);

  useEffect(() => {
    if (!conversationId) {
      stopPostQuestion();
    }
    return () => {
      setCopiedQuestion(''); // clear copy when change conversation
    };
  }, [conversationId, stopPostQuestion]);

  return (
    <>
      <div className='flex flex-1 flex-col justify-between overflow-hidden'>
        {chatThread.length <= 0 && !isSmallHeight && emptyChatComponent}

        {chatThread.length > 0 && (
          <ChatThread
            {...{
              thread: chatThread,
              loading: createNewChatLoading,
              onRefreshAnswer,
              triggerScrollToBottom,
              oldChatLoading: oldConversationFetcher.isLoading,
              copyQuestion,
            }}
          />
        )}
      </div>

      <ChatInput
        {...{
          ref: chatInputRef,
          onSubmit: onSubmitQuestion,
          showRecommendQuestions: chatThread.length <= 0,
          placeholder: 'Ask Magna AI...',
          disabled: isInputDisabled,
          copiedQuestion,
          stopPostQuestion: onStopPostQuestion,
          createNewChatLoading,
          refreshChatLoading,
          isEnoughStorage,
          isReadOnlySessionChat: isReadOnlySessionChat,
        }}
      />
      {show && (
        <BuyMoreResourceDialog
          open={show}
          title={'Warning'}
          content={'Your Questions have run out. Consider exchange more to ensure continued use.'}
          onConfirm={() => handleBuyMoreResource()}
          onCancel={() => setShow(false)}
          loading={isLoading}
        />
      )}
    </>
  );
};

export default Chat;

Chat.displayName = 'Chat';
