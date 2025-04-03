'use client';
import { HelpfulQuestion } from '@/app/api/__generated__/api';
import useCancelToken from '@/app/hooks/useCancelToken';
import axios from 'axios';
import { usePathname } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useChatStore } from '../chat/chat-store';
import classNames from 'classnames';

type RecommendQuestionsProps = {
  handleRecommendQuestionClick?: (question: string) => void;
};

const RecommendQuestions = (props: RecommendQuestionsProps) => {
  const { handleRecommendQuestionClick } = props;

  const handleQuestionClick = useCallback(
    (question: string) => {
      if (handleRecommendQuestionClick) {
        handleRecommendQuestionClick(question);
      }
    },
    [handleRecommendQuestionClick],
  );
  const pathname = usePathname();
  const { cancelToken } = useCancelToken();
  const { idsSharedSessionChat, isAlreadyHasDocument } = useChatStore();

  const [conversationId] = useQueryState('c', parseAsString);
  const [isReadOnlySessionChat, setIsReadOnlySessionChat] = useState(false);
  const [recommendQuestions, setRecommendQuestions] = useState<HelpfulQuestion[]>([]);

  const isLegalChatPage = pathname.startsWith('/legal-chat');
  const isPolicyAnalyzerPage = pathname.startsWith('/policy-analyzer');
  const isDiscoveryToolPage = pathname.startsWith('/discovery-tool');

  useEffect(() => {
    if (conversationId) {
      setIsReadOnlySessionChat(idsSharedSessionChat.includes(conversationId));
    }
  }, [idsSharedSessionChat, conversationId]);

  const fetchRecommendQuestions = useCallback(async () => {
    try {
      const helpfulUrl = '/api/plg/chats/helpful-questions';
      const url = isLegalChatPage
        ? `${helpfulUrl}/general/`
        : isPolicyAnalyzerPage
          ? `${helpfulUrl}/policy/`
          : isDiscoveryToolPage
            ? `${helpfulUrl}/policy/`
            : '';

      const response = await axios.get<Promise<HelpfulQuestion[]>>(url, { cancelToken });
      return response.data;
    } catch (error) {
      console.log('error', error);
    }
  }, []);

  const { data } = useQuery(['recommendQuestions', pathname], fetchRecommendQuestions, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      if (!isAlreadyHasDocument && isLegalChatPage && data.length > 2) {
        setRecommendQuestions(data.slice(2));
      } else {
        setRecommendQuestions(data);
      }
    }
  }, [data, isAlreadyHasDocument, isLegalChatPage]);

  return (
    <div className='mb-4 grid flex-1 grid-cols-1 gap-4 md:mb-6 md:grid-cols-2 2xl:gap-6'>
      {recommendQuestions.map((question) => {
        return (
          <div
            key={question.question}
            role='button'
            onClick={() => {
              !isReadOnlySessionChat && handleQuestionClick(question.answer);
            }}
            className={classNames(
              'w-full cursor-pointer rounded-xl border border-neutrual-50  px-4 py-3 transition-colors hover:border-[#A7F2C7] hover:shadow-neutrual-shadow-xl lg:px-5 lg:py-4',
              {
                '!cursor-not-allowed': isReadOnlySessionChat,
              },
            )}
          >
            <div className='font-bold text-text-support 2xl:text-base'>{question.question}</div>
            <div className='font-normal text-text-support 2xl:text-base'>{question.answer}</div>
          </div>
        );
      })}
    </div>
  );
};

export default RecommendQuestions;

RecommendQuestions.displayName = 'RecommendQuestions';
