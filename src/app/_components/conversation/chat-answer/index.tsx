/* eslint-disable react/no-unescaped-entities */
'use client';
import { ChatItemInterface } from '@/app/_components/conversation/chat/useChat';
import Typewriter from '@/app/_components/conversation/typewriter';
import noop from '@/app/utils/noOperation';
import {
  CHAT_SESSION_BOOKMARK_QUERY_KEY,
  MAGNA_AI_BOOKMARK_QUERY_KEY,
  POLICY_BOOKMARK_QUERY_KEY,
} from '@/config';
import { Bookmark, useBookmarkContext } from '@/contexts/BookmarkContext';
import { Button, Tooltip } from '@fluentui/react-components';
import {
  ArrowCounterclockwise24Regular,
  Bookmark24Filled,
  Bookmark24Regular,
  ChevronLeft24Regular,
  ChevronRight24Regular,
  Copy24Regular,
  ThumbDislike24Filled,
  ThumbDislike24Regular,
  ThumbLike24Filled,
  ThumbLike24Regular,
} from '@fluentui/react-icons';
import axios, { AxiosError } from 'axios';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import CustomIcon from '../../common/CustomIcon';
import { useChatStore } from '../chat/chat-store';
// import Markdown from 'react-markdown';
import Markdown from 'markdown-to-jsx';
import PopupCitation from './PopupCitation';

import styles from './index.module.scss';
import { isTrialEnded } from '@/app/utils/checkTrialEnded';
import { useProfileStore } from '../../profile/profile-store';
import ConfirmDialog from '../../common/ConfirmDialog';
import { parseAsString, useQueryState } from 'nuqs';
import { escapedId } from '@/app/utils';

type ChatAnswerProps = {
  chatItem?: ChatItemInterface;
  loading?: boolean;
  isLast?: boolean;
  onRefreshAnswer?: () => void;
  answerCount?: number;
  onNextAnswer?: () => void;
  onPrevAnswer?: () => void;
  showingAnswerIndex?: number;
  refreshAnswerLoading?: boolean;
  skeleton?: boolean;
  errorState?: AxiosError;
};

const ChatAnswer = (props: ChatAnswerProps) => {
  const {
    chatItem,
    refreshAnswerLoading,
    isLast,
    onRefreshAnswer,
    onNextAnswer = noop,
    onPrevAnswer = noop,
    showingAnswerIndex = 0,
    answerCount = 0,
    skeleton,
  } = props;

  const [show, setShow] = useState<boolean>(false);
  const [showAccessRestrictedDialog, setShowAccessRestrictedDialog] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [likeStatus, setLikeStatus] = useState<boolean | null>(chatItem?.liked ?? null);
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profileInfo } = useProfileStore();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarkContext();
  const bookmark: Bookmark | undefined = bookmarks.find((bookmark) => bookmark.id === chatItem?.id);
  const {
    updateChatThread,
    createNewChatLoading,
    isEmptyDocumentBeforeSubmitQuestion,
    idsSharedSessionChat,
    error,
    setThinking,
    thinking,
  } = useChatStore();
  const trialHasEnded =
    isTrialEnded(profileInfo?.current_subscription?.trial_period_end as string) &&
    profileInfo?.current_subscription?.price_plan === null;
  const [conversationId] = useQueryState('c', parseAsString);
  const [isReadOnlySessionChat, setIsReadOnlySessionChat] = useState(false);
  const errMsg = (error?.response?.data as { detail?: string })?.detail || undefined;

  const postProcessAnswerText = (data: string): string => {
    if (data.includes('\n\n')) {
      return data.replaceAll('\n\n', '\n');
    }
    if (data.includes('   ')) {
      return data.replaceAll('   ', '');
    }
    return data;
  };

  useEffect(() => {
    if (conversationId) {
      setIsReadOnlySessionChat(idsSharedSessionChat.includes(conversationId));
    }
  }, [idsSharedSessionChat, conversationId]);

  useEffect(() => {
    setLikeStatus(chatItem?.liked ?? null);
  }, [chatItem]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(chatItem?.content || '');
    setIsCopied(true);

    // reset copied state
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }, [chatItem?.content]);

  const temporaryAnswer = useMemo(() => {
    return chatItem?.temporary;
  }, [chatItem]);

  const handleLike = async (status: boolean) => {
    let nextStatus: boolean | null = status;
    if (status === likeStatus) nextStatus = null;
    const likeUrl = `/api/plg/chats/session/chat/${chatItem?.id}/like/`;

    try {
      await axios.patch(likeUrl, {
        liked: nextStatus,
      });
      setLikeStatus(nextStatus);
      updateChatThread(chatItem!, nextStatus);
    } catch (error) {
      console.error('Error liking chat', error);
      setLikeStatus(likeStatus);
    }
  };

  const handleBookmark = debounce(async () => {
    try {
      if (!chatItem?.id) return;
      await fetch(`/api/plg/chats/session/chat/${chatItem?.id}/bookmark/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked: !bookmark }),
      });

      !bookmark
        ? addBookmark({ id: chatItem.id, name: chatItem.bookmark_name || chatItem.content })
        : removeBookmark(chatItem.id);

      // Refetch bookmark in sidebar
      if (pathname.startsWith('/legal-chat')) {
        queryClient.invalidateQueries(MAGNA_AI_BOOKMARK_QUERY_KEY);
      }

      if (pathname.startsWith('/policy-analyzer') && params.id) {
        queryClient.invalidateQueries([POLICY_BOOKMARK_QUERY_KEY, params.id]);
      }
      if (pathname.startsWith('/discovery-tool') && params.id) {
        queryClient.invalidateQueries([CHAT_SESSION_BOOKMARK_QUERY_KEY, params.id]);
      }
    } catch (error) {}
  }, 500);

  return (
    <div className='group mt-8'>
      <div className='flex'>
        <div className='flex items-center justify-center'>
          <CustomIcon name='legal-bot-avatar' width={28} height={28} />
        </div>

        <h4 className='ml-3 text-base font-medium'>Magna AI</h4>
      </div>

      <div
        className={classNames(
          `mt-3 whitespace-pre-wrap break-words rounded-xl bg-bg-disable px-5 py-4 text-base text-color-msg-user-text ${escapedId(chatItem?.id)}`,
          {
            '!bg-bg-text-error ring !ring-danger': chatItem?.isError,
            'animate-pulse': skeleton,
            'bg-transparent !p-0': !thinking && isLast && !chatItem,
          },
        )}
        id={chatItem?.id}
      >
        <div className='markdown prose w-full break-words text-inherit prose-ul:-m-0'>
          {thinking && isLast ? (
            <div className='my-3 flex h-1 w-fit items-center gap-0.5'>
              <span className='sr-only'>generating...</span>
              <div className='size-2 animate-bounce animate-resize rounded-full bg-text-support [animation-delay:-0.3s]'></div>
              <div className='size-2 animate-bounce animate-resize rounded-full bg-text-support [animation-delay:-0.15s]'></div>
              <div className='size-2 animate-bounce animate-resize rounded-full bg-text-support'></div>
            </div>
          ) : (
            <>
              {chatItem?.isError ? (
                <p className='m-0'>
                  {`${errMsg ? errMsg : isEmptyDocumentBeforeSubmitQuestion ? 'To chat with Magna, please select the document you want to discuss.' : "I'm having difficulty generating a new answer right now. Please try again by using refresh button"} `}
                </p>
              ) : (
                <>
                  {chatItem?.typing && chatItem?.content ? (
                    <Typewriter
                      {...{
                        text: chatItem?.content || '',
                        speed: 0,
                        cursor: false,
                        random: 3,
                      }}
                    />
                  ) : (
                    <div className={styles.chatAnswer}>
                      <Markdown>
                        {chatItem
                          ? chatItem?.content && postProcessAnswerText(chatItem.content)
                          : ''}
                      </Markdown>
                      {chatItem?.source_info?.page_number && (
                        <p
                          className='cursor-pointer italic underline'
                          onClick={() => setShow(true)}
                        >
                          This answer is found{' '}
                          {chatItem?.source_info?.document_name
                            ? `in ${chatItem?.source_info?.document_name}, `
                            : ''}
                          on page {chatItem?.source_info?.page_number}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      {!createNewChatLoading && (
        <div className='mt-3 flex'>
          {!skeleton && !chatItem?.isError && !refreshAnswerLoading && (
            <>
              <Tooltip
                content={isCopied ? 'Copied' : 'Copy'}
                relationship='inaccessible'
                withArrow
                positioning='above-start'
              >
                <Button
                  onClick={copyToClipboard}
                  icon={<Copy24Regular />}
                  appearance='transparent'
                />
              </Tooltip>
              {!isReadOnlySessionChat && (
                <>
                  <Tooltip
                    content='Good response'
                    relationship='inaccessible'
                    withArrow
                    positioning='above-start'
                  >
                    <Button
                      appearance='transparent'
                      icon={
                        likeStatus === true ? (
                          <ThumbLike24Filled className='text-aero-8' />
                        ) : (
                          <ThumbLike24Regular />
                        )
                      }
                      onClick={() => handleLike(true)}
                    />
                  </Tooltip>
                  <Tooltip
                    content='Bad response'
                    relationship='inaccessible'
                    withArrow
                    positioning='above-start'
                  >
                    <Button
                      appearance='transparent'
                      onClick={() => handleLike(false)}
                      icon={
                        likeStatus === false ? (
                          <ThumbDislike24Filled className='text-aero-8' />
                        ) : (
                          <ThumbDislike24Regular />
                        )
                      }
                    />
                  </Tooltip>
                  <Tooltip
                    content={bookmark ? 'Bookmarked' : 'Bookmark'}
                    relationship='inaccessible'
                    withArrow
                    positioning='above-start'
                  >
                    <Button
                      appearance='transparent'
                      icon={
                        bookmark ? (
                          <Bookmark24Filled className='text-aero-8' />
                        ) : (
                          <Bookmark24Regular />
                        )
                      }
                      onClick={handleBookmark}
                    />
                  </Tooltip>
                </>
              )}
            </>
          )}

          {isLast && !isReadOnlySessionChat && (
            <Tooltip
              content='Refresh answer'
              relationship='inaccessible'
              withArrow
              positioning='above-start'
            >
              <Button
                onClick={() => {
                  if (trialHasEnded) {
                    setShowAccessRestrictedDialog(true);
                    return;
                  }
                  setThinking(true);
                  onRefreshAnswer && onRefreshAnswer();
                }}
                appearance='transparent'
                className={classNames({
                  'opacity-75': refreshAnswerLoading,
                })}
                disabled={refreshAnswerLoading}
                icon={<ArrowCounterclockwise24Regular />}
              />
            </Tooltip>
          )}
          <div
            className={classNames('', {
              hidden: !answerCount || answerCount <= 1,
            })}
          >
            {onPrevAnswer && (
              <Button
                onClick={onPrevAnswer}
                appearance='transparent'
                disabled={showingAnswerIndex === 0}
                icon={<ChevronLeft24Regular />}
              />
            )}
            <span>
              {showingAnswerIndex + 1} / {answerCount}
            </span>
            {onNextAnswer && (
              <Button
                onClick={onNextAnswer}
                disabled={showingAnswerIndex === answerCount - 1}
                appearance='transparent'
                icon={<ChevronRight24Regular />}
              />
            )}
          </div>
        </div>
      )}

      {show && (
        <PopupCitation
          open={show}
          content={chatItem?.source_info?.page_content}
          onClose={() => setShow(false)}
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
    </div>
  );
};

export default ChatAnswer;

ChatAnswer.displayName = 'ChatAnswer';
