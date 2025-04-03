import ChatAnswer from '@/app/_components/conversation/chat-answer';
import { ChatItemInterface } from '@/app/_components/conversation/chat/useChat';
import { useBookmarkContext } from '@/contexts/BookmarkContext';
import { parseAsString, useQueryState } from 'nuqs';
import React, { useEffect } from 'react';
import { useQueryClient } from 'react-query';

type Props = {
  answers: ChatItemInterface[];
  onRefreshAnswer?: () => void;
  isLast?: boolean;
  typing?: boolean;
};

const ChatAnswerCarousel = (props: Props) => {
  const { answers, isLast, onRefreshAnswer, typing } = props;

  const [showingAnswerIndex, setShowingAnswerIndex] = React.useState<number>(answers.length - 1);
  const [conversationId] = useQueryState('c', parseAsString);
  const { clickedBookmark, onClickBookmark } = useBookmarkContext();

  const onNextAnswer = React.useCallback(() => {
    if (showingAnswerIndex < answers.length - 1) {
      setShowingAnswerIndex((prev) => prev + 1);
    }
    onClickBookmark(undefined);
  }, [answers.length, onClickBookmark, showingAnswerIndex]);

  const onPrevAnswer = React.useCallback(() => {
    if (showingAnswerIndex > 0) {
      setShowingAnswerIndex((prev) => prev - 1);
    }
    onClickBookmark(undefined);
  }, [onClickBookmark, showingAnswerIndex]);

  useEffect(() => {
    if (clickedBookmark?.id) {
      const index = answers.findIndex((item) => item.id === clickedBookmark.id);
      if (index !== -1) {
        setShowingAnswerIndex(index);
        return;
      }
    }
  }, [clickedBookmark?.id, answers, clickedBookmark]);

  useEffect(() => {
    setShowingAnswerIndex(answers.length - 1);
  }, [answers.length]);

  const queryClient = useQueryClient();

  const refreshAnswer = queryClient.getQueryState(['refreshAnswer', conversationId]);

  return (
    <ChatAnswer
      {...{
        chatItem: answers[showingAnswerIndex],
        isLast,
        onRefreshAnswer,
        onNextAnswer,
        onPrevAnswer,
        answerCount: answers.length,
        showingAnswerIndex,
        refreshAnswerLoading: refreshAnswer?.isFetching,
        typing: typing,
      }}
    />
  );
};

export default ChatAnswerCarousel;

ChatAnswerCarousel.displayName = 'ChatAnswerCarousel';
