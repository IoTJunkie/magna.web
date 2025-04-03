'use client';
import EditIcon from '@/app/_components/icons/edit-icon';
import { ConfirmDeleteHistory } from '@/app/_components/sidebar/conversation-histories/confirm-delete-history';
import HistoryItem from '@/app/_components/sidebar/conversation-histories/history-item';
import { ChatSessionHistory } from '@/app/api/__generated__/api';
import useToastComponent from '@/app/hooks/Toast';
import useAbortableFetch from '@/app/hooks/useAbortableFetch';
import fetchData from '@/app/utils/fetchData';
import urlEncode from '@/app/utils/urlEncode';
import {
  CHAT_SESSION_HISTORY_KEY,
  ChatHistoryItem,
  LEGAL_HISTORY_QUERY_KEY,
  Paginated,
  POLICY_HISTORY_QUERY_KEY,
  STORAGE_ITEM_NAME,
} from '@/config';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button, makeStyles, MenuList, shorthands, Spinner } from '@fluentui/react-components';
import { CheckmarkCircle24Regular, ErrorCircle24Regular } from '@fluentui/react-icons';
import axios from 'axios';
import classNames from 'classnames';
import { getSession, useSession } from 'next-auth/react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useWindowSize } from 'usehooks-ts';
import { useChatStore } from '../../conversation/chat/chat-store';
import useChat from '../../conversation/chat/useChat';
import { useBookmarkContext } from '@/contexts/BookmarkContext';
import { DialogShareHistory } from './dialog-share-history';
import { useProfileStore } from '../../profile/profile-store';
import { IMember } from '@/app/settings/team-management/types';
import LegalChatIcon from '../../icons/legal-chat-icon';
import Image from 'next/image';
import PencilIcon from '../../icons/pencil-icon';
import CustomIcon from '../../common/CustomIcon';
import { useTourContext } from '@/contexts/TourContext';

type Props = {
  listSharedSession: ChatHistoryItem[];
};

const useMenuItemsStyles = makeStyles({
  root: {
    ...shorthands.padding('0'),
    width: '100%',
  },

  menuItem: {
    ...shorthands.padding('0'),
    maxWidth: 'none',
  },
  configMenuItem: {
    maxWidth: '100%',
    width: '100%',
  },
});

type HistoryByDate = {
  today: ChatSessionHistory[];
  yesterday: ChatSessionHistory[];
  laterFilter: ChatSessionHistory[];
};

const ConversationHistories = ({ listSharedSession }: Props) => {
  const {
    isCollapsed,
    toggleSidebar,
    isRefreshPolicyHistory,
    isRefreshCaseHistory,
    resetRefreshPolicyHistory,
    resetRefreshCaseHistory,
  } = useSidebar();
  const styles = useMenuItemsStyles();
  const [conversationId, setConversationId] = useQueryState(
    'c',
    parseAsString.withOptions({
      shallow: false,
    }),
  );
  const { initBookmark } = useBookmarkContext();

  const { abortSignal, isAbortError } = useAbortableFetch();

  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const pathNameRef = useRef(pathname);

  const policyId = pathname.startsWith('/policy-analyzer') && params.id ? params.id : undefined;
  const caseId = pathname.startsWith('/discovery-tool') && params.id ? params.id : undefined;

  const [histories, setHistories] = useState<Paginated<HistoryByDate>>();

  const [isPolicyIdPage, setIsPolicyIdPage] = useState(false);
  const [isCaseIdPage, setIsCaseIdPage] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isOpenShareDialog, setIsOpenShareDialog] = useState(false);
  const [actionActiveHistory, setActionActiveHistory] = useState<ChatSessionHistory | null>(null);
  const [toastMessage, setToastMessage] = useState<string | JSX.Element>('');

  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [policyName, setPolicyName] = useState<string | null>(null);
  const [memberList, setMemberList] = useState<IMember[]>([]);
  const [tourGuideFinished, setTourGuideFinished] = useState<boolean>(false);
  const { createNewChatLoading, setIgnoreUpdateChatThread, refreshChatLoading } = useChatStore();

  const { data: session } = useSession();
  const isFirstLogin = session?.user?.first_login;

  const { stopPostQuestion } = useChat();

  const isLegalChatPage = pathname.startsWith('/legal-chat');
  const isIndexPolicyPage = pathname === '/policy-analyzer';
  const isIndexPolicyNewPage = pathname === '/policy-analyzer/new';
  const isPolicyAnalyzerPage = pathname.startsWith('/policy-analyzer');
  const isIndexCasePage = pathname === '/discovery-tool';
  const isIndexCaseNewPage = pathname === '/discovery-tool/new';
  const isCaseListPage = pathname.startsWith('/discovery-tool');
  const { profileInfo } = useProfileStore();
  const team = profileInfo?.team || null;

  const { runTour } = useTourContext();

  useEffect(() => {
    if (!runTour) {
      setTourGuideFinished(true);
    }
  }, [runTour]);

  useEffect(() => {
    const statusTourStore = !!localStorage.getItem(STORAGE_ITEM_NAME.tour_guide_finished);
    setTourGuideFinished(statusTourStore);
  }, [pathname]);

  const onOpenActionMenu = (item: ChatSessionHistory) => {
    setActionActiveHistory(item);
  };
  const windowSize = useWindowSize();

  const onCloseSidebar = () => {
    if (windowSize.width > 640) {
      return;
    }
    toggleSidebar(false);
  };

  useEffect(() => {
    setIsPolicyIdPage(isPolicyAnalyzerPage);
    setIsCaseIdPage(isCaseListPage);
  }, [isPolicyAnalyzerPage, isCaseListPage]);

  const fetchHistories = useCallback(
    async ({ pageParam = 1 }) => {
      const sessionId = await getSession();
      try {
        const urlEncoded = urlEncode({
          page: pageParam,
        });

        // const allPolicyHistories = `/api/plg/chats/history/policy/?${urlEncoded}`;
        const legalHistoriesUrl = `/api/plg/chats/history/legal/?${urlEncoded}`;
        const historiesByPolicyId = `/api/plg/chats/history/policy/${policyId}/?${urlEncoded}`;
        const historiesPolicyLatestInteract =
          '/api/plg/chats/history/policy?use_latest_policy=true';
        const historiesCaseLatestInteract = '/api/plg/chats/session/discovery?use_latest_case=true';
        const historiesByCaseId = `/api/plg/chats/session/discovery?case_id=${caseId}`;

        const url = () => {
          if (isLegalChatPage) return legalHistoriesUrl;
          if (isIndexPolicyPage || isIndexPolicyNewPage) return historiesPolicyLatestInteract; // return legalHistoriesUrl for index policy page
          if (isIndexCasePage || isIndexCaseNewPage) return historiesCaseLatestInteract;
          if (isCaseIdPage) return historiesByCaseId;
          if (isPolicyIdPage) return historiesByPolicyId;
          return legalHistoriesUrl;
        };
        if (isIndexCasePage || isCaseListPage || isIndexCaseNewPage) {
          const response = await fetchData<Paginated<ChatSessionHistory[]>>(url(), {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${sessionId?.user?.access_token}`,
            },
            signal: abortSignal,
          });
          return response;
        } else {
          const response = await fetchData<Paginated<ChatSessionHistory[]>>(url(), {
            signal: abortSignal,
          });
          return response;
        }
      } catch (error: unknown) {
        if (!isAbortError(error)) {
          console.error('💥 There was an error fetching data: ', error);
        }
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        }; // return a default ChatSessionHistory object in case of an error
      }
    },
    [
      abortSignal,
      isAbortError,
      isLegalChatPage,
      isIndexPolicyPage,
      isPolicyIdPage,
      isIndexPolicyNewPage,
      isIndexCasePage,
      isIndexCaseNewPage,
      isCaseIdPage,
      policyId,
      isIndexPolicyNewPage,
      isCaseIdPage,
      caseId,
    ],
  );

  const sortData = (data: Paginated<ChatSessionHistory[]>[], isCaseHistory: boolean) => {
    let sorted: any = null;
    if (!isCaseHistory) {
      sorted = data
        .map((page) => page.results)
        .flat()
        .sort((a, b) => {
          return new Date(b.modified || '').getTime() - new Date(a.modified || '').getTime();
        });
    } else {
      sorted = data.flat().sort((a, b) => {
        return new Date(b.modified || '').getTime() - new Date(a.modified || '').getTime();
      });
    }

    return sorted;
  };

  const queryKey = () => {
    if (isLegalChatPage) return LEGAL_HISTORY_QUERY_KEY;
    if (isIndexPolicyPage) return LEGAL_HISTORY_QUERY_KEY;
    if (isIndexCasePage) return LEGAL_HISTORY_QUERY_KEY;
    if (isPolicyIdPage) return [POLICY_HISTORY_QUERY_KEY, policyId];
    if (isCaseIdPage) return [CHAT_SESSION_HISTORY_KEY, caseId];
    return LEGAL_HISTORY_QUERY_KEY;
  };

  const historiesFetcher = useInfiniteQuery<Paginated<ChatSessionHistory[]>, Error>(
    queryKey(),
    fetchHistories,
    {
      getNextPageParam: (lastPage) => lastPage?.next ?? false,
      refetchOnWindowFocus: false,
      onSuccess(data) {
        const sort = sortData(data.pages, isCaseListPage || isIndexCasePage || isIndexCaseNewPage);
        if (!sort.length) {
          setPolicyName(null);
        }
        if (isIndexPolicyPage && sort.length) {
          setPolicyName(sort[0]?.policy_name || null);
        }
        if (isCaseListPage && sort.length) {
          setPolicyName(sort[0]?.case_name);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0); // set to start of the day

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dayBeforeYesterday = new Date(yesterday);
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

        const todayFilter = sort.filter((item: any) => {
          const itemDate = new Date(item.modified || '');
          itemDate.setHours(0, 0, 0, 0); // set to start of the day
          return itemDate.getTime() === today.getTime();
        });

        const yesterdayFilter = sort.filter((item: any) => {
          const itemDate = new Date(item.modified || '');
          itemDate.setHours(0, 0, 0, 0); // set to start of the day
          return itemDate.getTime() === yesterday.getTime();
        });

        const laterFilter = sort.filter((item: any) => {
          const itemDate = new Date(item.modified || '');
          itemDate.setHours(0, 0, 0, 0); // set to start of the day
          return itemDate.getTime() <= dayBeforeYesterday.getTime();
        });

        const filterByDate = {
          today: todayFilter,
          yesterday: yesterdayFilter,
          laterFilter: laterFilter,
        };

        setHistories({
          count: data.pages[0].count,
          next: data.pages[0].next,
          previous: data.pages[0].previous,
          results: filterByDate,
        });
      },
    },
  );

  useEffect(() => {
    if (pathNameRef.current && pathNameRef.current !== pathname) {
      historiesFetcher.refetch();
      pathNameRef.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    if (isRefreshPolicyHistory) {
      historiesFetcher.refetch();
      resetRefreshPolicyHistory(false);
    }
  }, [isRefreshPolicyHistory]);

  useEffect(() => {
    if (isRefreshCaseHistory) {
      historiesFetcher.refetch();
      resetRefreshCaseHistory(false);
    }
  }, [isRefreshCaseHistory]);

  const isLoading = historiesFetcher.isFetching;

  const onSelectHistory = (id: string, policy?: string) => {
    if (createNewChatLoading || refreshChatLoading) {
      setIgnoreUpdateChatThread(true);
      stopPostQuestion();
    }
    onCloseSidebar();
    if ((isIndexPolicyPage || isIndexPolicyNewPage) && policy) {
      router.push(`/policy-analyzer/${policy}?c=${id}`);
      return;
    }
    if ((isIndexCasePage || isIndexCaseNewPage) && policy) {
      router.push(`/discovery-tool/${policy}?c=${id}`);
      return;
    }
    // clear bookmark
    initBookmark([], id);
    setConversationId(id);
  };

  const onCreateNewChat = () => {
    initBookmark([], null);
    router.push(pathname);
  };

  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: toastMessage,
  });

  const onDeleteHistory = async () => {
    setIsDeleting(true);
    try {
      const deleteUrl = `/api/plg/chats/session/${actionActiveHistory?.id}/delete/`;
      await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      setToastMessage(
        <div className='rounded-lg bg-white-5 p-4 shadow-lg ring-1'>
          <CheckmarkCircle24Regular className='mr-3 text-green-500' />

          <span className='text-color-text-support'>Chat history deleted successfully</span>
        </div>,
      );
      showToast();
      if (isLegalChatPage) {
        router.push('/legal-chat/');
      }
      if (isPolicyAnalyzerPage && params.id) {
        router.push(`/policy-analyzer/${params.id}`);
      }
      if (isCaseListPage && params.id) {
        router.push(`/discovery-tool/${params.id}`);
      }
    } catch (error) {
      console.log('error :>> ', error);
      setToastMessage(
        <div className='rounded-lg bg-white-5 p-4 shadow-lg ring-1'>
          <ErrorCircle24Regular className='mr-3 text-danger' />

          <span>Failed to delete chat history</span>
        </div>,
      );
      showToast();
    } finally {
      historiesFetcher.refetch();
      setIsDeleting(false);
      setIsOpenDeleteDialog(false);
    }
  };
  const onShareHistory = async (selectedMembers: string[], memberName: string) => {
    if (selectedMembers.length === 0) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/chats/session/${actionActiveHistory?.id}/update/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          body: JSON.stringify({
            shared_with: selectedMembers,
          }),
        },
      );

      if (response.ok) {
        setToastMessage(`Chat session shared with ${memberName} successfully`);
        setIntent('success');
      } else {
        const errorData = await response.json();
        const firstError =
          Array.isArray(errorData) && errorData.length > 0 ? errorData[0] : 'An error occurred';
        setToastMessage(firstError);
        setIntent('error');
      }
    } catch (error) {
      setIntent('error');
      setToastMessage(`An error occurred while sharing the chat session with ${memberName}`);
    } finally {
      showToast();
      setIsOpenShareDialog(false);
    }
  };

  useEffect(() => {
    const getMemberList = async () => {
      try {
        const session = await getSession();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/team-member/${team?.team_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.user?.access_token}`,
            },
          },
        );
        if (response.ok) {
          const rs = await response.json();
          const filteredMembers = rs.filter((member: any) => member.email !== profileInfo?.email);
          setMemberList(filteredMembers);
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    if (team?.team_id) {
      getMemberList();
    }
  }, [team?.team_id]);

  const refetchHistories = () => {
    historiesFetcher.refetch();
  };

  return (
    <div className='flex flex-1 flex-col justify-between'>
      {(isFirstLogin && !tourGuideFinished && histories?.count === 0) || runTour ? (
        <div className='text-neutrual-200 test relative size-full font-semibold'>
          <div className='pl-2'>Chat History</div>
          <div className='mt-2 flex h-10 w-full items-center gap-2 rounded !bg-bg-menu p-2 font-medium'>
            Session chat
            <div className={classNames('absolute right-4 w-5 group-hover:block')}>
              <Image src='/svg/three-dot-menu.svg' width={12} height={22} alt='' />
            </div>
            <div className='absolute right-[1.125rem] top-[4.625rem] flex h-[9.375rem] w-40 flex-col justify-center whitespace-nowrap rounded bg-white p-1 align-middle text-sm font-light shadow-[0_0_0.125rem_rgba(0,0,0,0.12),_0_0.5rem_1rem_rgba(0,0,0,0.14)]'>
              <div className='guide-rename flex h-fit items-center p-2'>
                <PencilIcon />
                <span className='ml-1 gap-1'>Rename</span>
              </div>
              <div className='guide-download-history flex items-center p-2'>
                <CustomIcon name='download-chat' width={20} height={20} />
                <span className='ml-1 gap-1'>Download history</span>
              </div>
              <div className='guide-share-history flex items-center p-2'>
                <CustomIcon name='share-history' width={20} height={20} />
                <span className='ml-1 gap-1'>Share</span>
              </div>
              <div className='guide-delete flex items-center p-2'>
                <Image src='/svg/trash-red.svg' width={20} height={20} alt='' />
                <span className='ml-1 gap-1 text-red-500'>Delete</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      {isLoading ? (
        <div className='flex h-full grow items-center justify-center'>
          <Spinner size='small' />
        </div>
      ) : (
        <div className='h-full max-h-[calc(100vh-26.275rem)] grow overflow-y-auto overflow-x-hidden'>
          {policyName &&
            (isIndexPolicyPage ||
              isIndexPolicyNewPage ||
              isIndexCasePage ||
              isIndexCaseNewPage) && (
              <div
                className={classNames('mb-3 truncate pl-2 pr-3 text-sm font-semibold text-aero-8', {
                  hidden: isCollapsed,
                })}
              >
                {policyName}
              </div>
            )}
          {histories &&
            histories?.results &&
            Object.keys(histories?.results).map(
              (key) =>
                histories?.results[key as keyof HistoryByDate].length > 0 && (
                  <div key={key}>
                    <p
                      className={classNames(
                        'px-2 py-1 text-[0.625rem] font-semibold text-[#ABABB1]',
                        {
                          hidden: isCollapsed,
                        },
                      )}
                    >
                      <span className='capitalize'>
                        {key === 'today'
                          ? 'TODAY'
                          : key === 'yesterday'
                            ? 'YESTERDAY'
                            : 'LAST 3 DAYS'}
                      </span>
                    </p>
                    <MenuList className={classNames(styles.root)} key={key}>
                      {histories?.results[key as keyof HistoryByDate].map((item) => (
                        <HistoryItem
                          key={item.id}
                          {...{
                            item,
                            conversationId,
                            styles,
                            onSelectHistory,
                            isCollapsed,
                            isPolicyIdPage,
                            isCaseIdPage,
                            onOpenActionMenu,
                            onDeleteClick: () => setIsOpenDeleteDialog(true),
                            refetchHistories,
                            onShareHistory: () => setIsOpenShareDialog(true),
                            isSharedBookMark: false,
                          }}
                        />
                      ))}
                    </MenuList>
                    {isLegalChatPage && listSharedSession.length > 0 && (
                      <div className='my-4 h-[0.035rem] w-full bg-neutrual-50' />
                    )}
                  </div>
                ),
            )}
          {isLegalChatPage && listSharedSession.length > 0 && (
            <>
              <p
                className={classNames('px-2 py-1 text-[0.625rem] font-semibold text-[#ABABB1]', {
                  hidden: isCollapsed,
                })}
              >
                <span className='capitalize'>SHARED</span>
              </p>
              <MenuList className={classNames(styles.root)}>
                {listSharedSession.map((item: any) => (
                  <HistoryItem
                    key={item.id}
                    {...{
                      item,
                      conversationId,
                      styles,
                      onSelectHistory,
                      isCollapsed,
                      isPolicyIdPage,
                      isCaseIdPage,
                      onOpenActionMenu,
                      onDeleteClick: () => setIsOpenDeleteDialog(true),
                      refetchHistories,
                      onShareHistory: () => setIsOpenShareDialog(true),
                      isSharedBookMark: true,
                    }}
                  />
                ))}
              </MenuList>
            </>
          )}
        </div>
      )}

      {(isPolicyIdPage || isCaseIdPage) &&
        conversationId &&
        (isCollapsed ? (
          <div
            className='m-auto flex w-fit cursor-pointer justify-center rounded bg-aero-7 p-2 text-white'
            onClick={onCreateNewChat}
          >
            <EditIcon className='size-5' />
          </div>
        ) : (
          <Button size='large' appearance='primary' onClick={onCreateNewChat}>
            <EditIcon className='mr-3' />
            <span className='font-semibold'>New chat</span>
          </Button>
        ))}
      <DialogShareHistory
        open={isOpenShareDialog}
        onClose={() => setIsOpenShareDialog(false)}
        onConfirm={onShareHistory}
        isLoading={isSharing}
        memberList={memberList}
      />
      <ConfirmDeleteHistory
        open={isOpenDeleteDialog}
        onClose={() => setIsOpenDeleteDialog(false)}
        onConfirm={onDeleteHistory}
        isLoading={isDeleting}
      />

      {toasterComponent}
    </div>
  );
};

export default ConversationHistories;

ConversationHistories.displayName = 'ConversationHistories';
