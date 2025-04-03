import ChatAnswerCarousel from '@/app/_components/conversation/chat-answer-carousel';
import ChatQuestion from '@/app/_components/conversation/chat-question';
import { ChatItemInterface } from '@/app/_components/conversation/chat/useChat';
import ScrollToBottomButton from '@/app/_components/conversation/scroll-to-bottom-button';
import noop from '@/app/utils/noOperation';
import { useEffect } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import { useChatStore } from '../chat/chat-store';

type Props = {
  thread: ChatItemInterface[];
  loading?: boolean;
  onRefreshAnswer?: () => void;
  oldChatLoading?: boolean;
  triggerScrollToBottom?: boolean;
  copyQuestion?: (question: string) => void;
};

const ChatThread = (props: Props) => {
  const {
    thread,
    loading,
    onRefreshAnswer = noop,
    oldChatLoading,
    triggerScrollToBottom,
    copyQuestion,
  } = props;

  const index = props.thread.at(thread.length - 1)?.answers?.length;
  const content = props.thread[thread.length - 1].answers?.at(index ? index - 1 : 0)?.content;
  const { setThinking } = useChatStore();

  useEffect(() => {
    if (content === undefined || content === '') {
      setThinking(true);
    } else {
      setThinking(false);
    }
  }, [content, setThinking]);

  return (
    <ScrollToBottom className='max-h-full flex-1 pb-5' followButtonClassName='hidden'>
      <>
        {oldChatLoading ? (
          // display empty div while loading old chat like ChatGPT.
          <div></div>
        ) : (
          <>
            {thread.map((chatItem, threadIndex) => (
              <div
                key={chatItem.id}
                className='max-w-chat-layout mx-auto mt-6 w-full px-5 2xl:px-0'
              >
                <ChatQuestion {...{ chatItem, copyQuestion, loading }} />

                <ChatAnswerCarousel
                  {...{
                    answers: chatItem.answers || [],
                    isLast: threadIndex === thread.length - 1,
                    onRefreshAnswer,
                    typing: chatItem.typing,
                  }}
                />
              </div>
            ))}
          </>
        )}
      </>
      <ScrollToBottomButton
        {...{
          title: 'Scroll to bottom',
          trigger: triggerScrollToBottom,
        }}
      />
    </ScrollToBottom>
  );
};

export default ChatThread;

ChatThread.displayName = 'ChatThread';
