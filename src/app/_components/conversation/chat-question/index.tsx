import { ChatItemInterface } from '@/app/_components/conversation/chat/useChat';
import PencilIcon from '@/app/_components/icons/pencil-icon';
import { Avatar } from '@fluentui/react-components';
import { useProfileStore } from '../../profile/profile-store';
import { useChatStore } from '../chat/chat-store';
import { useEffect, useState } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

type ChatQuestionProps = {
  chatItem: ChatItemInterface;
  copyQuestion?: (question: string) => void;
  loading?: boolean;
};

const ChatQuestion = (props: ChatQuestionProps) => {
  const { chatItem, copyQuestion, loading } = props;
  const { profileInfo } = useProfileStore();
  const { idsSharedSessionChat } = useChatStore();
  const [conversationId] = useQueryState('c', parseAsString);

  const [isReadOnlySessionChat, setIsReadOnlySessionChat] = useState(false);

  useEffect(() => {
    if (conversationId) {
      setIsReadOnlySessionChat(idsSharedSessionChat.includes(conversationId));
    }
  }, [idsSharedSessionChat, conversationId]);

  return (
    <div>
      <div className='flex'>
        {profileInfo?.avatar_url ? (
          <Avatar
            size={28}
            image={{
              src: profileInfo?.avatar_url,
            }}
          />
        ) : isReadOnlySessionChat && chatItem?.user?.avatar_url ? (
          <div className='size-7  object-cover'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className='size-full rounded-[50%]' src={chatItem?.user.avatar_url} alt='' />
          </div>
        ) : (
          <div className='flex size-7 items-center justify-center rounded-[50%] bg-aero-12 text-xs text-neutral'>
            {profileInfo?.email.slice(0, 2).toUpperCase()}
          </div>
        )}

        <h4 className='ml-3 text-base font-medium'>
          {isReadOnlySessionChat
            ? chatItem?.user?.name?.trim()
              ? chatItem?.user?.name
              : chatItem?.user?.email
            : 'You'}
        </h4>
      </div>

      <div>
        <div className='mt-3 rounded-xl border border-neutrual-50 bg-neutral px-5 py-4'>
          <p className='text-base'>{chatItem.content}</p>
        </div>
        <div>
          {!loading && !isReadOnlySessionChat && (
            <button
              onClick={() => copyQuestion && copyQuestion(chatItem.content)}
              className='mt-2 text-sm font-medium text-primary hover:text-aero-7'
            >
              <PencilIcon className='mr-1 size-4' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatQuestion;

ChatQuestion.displayName = 'ChatQuestion';
