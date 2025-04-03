import { ChatItemInterface } from '@/app/_components/conversation/chat/useChat';
import { ChatItemRoles } from '@/config';

export const formattedChatThread = (chatThread: ChatItemInterface[]) => {
  return chatThread
    .filter((item: ChatItemInterface) => item.role === ChatItemRoles.USER)
    .map((userItem: ChatItemInterface) => {
      const assistantItem = chatThread.filter(
        (assistantItem: ChatItemInterface) => assistantItem.response_to === userItem.id,
      );
      return {
        ...userItem,
        answers: assistantItem,
      };
    });
};
