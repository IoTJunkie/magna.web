'use client';
import ConversationHistories from '@/app/_components/sidebar/conversation-histories';
import MenuItems from '@/app/_components/sidebar/menu-items';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button, Drawer, makeStyles, shorthands } from '@fluentui/react-components';
import { ArrowExport20Filled, ArrowExportRtl20Filled } from '@fluentui/react-icons';
import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';
import EditIcon from '../icons/edit-icon';
import { useBookmarkContext } from '@/contexts/BookmarkContext';
import { getSession } from 'next-auth/react';
import { ChatHistoryItem } from '@/config';
import { useChatStore } from '../conversation/chat/chat-store';

const useSidebarStyles = makeStyles({
  root: {
    width: 'fit-content',
    height: '100%',
    ...shorthands.borderRight('1px', 'solid', 'var(--color-screen-stroke)'),
    '@media screen and (max-width: 640px)': {
      position: 'absolute',
      width: '100%',
      zIndex: 50,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  },
});

const Sidebar = () => {
  const { isOpenSidebar, toggleCollapse, isCollapsed, toggleSidebar } = useSidebar();
  const sidebarStyles = useSidebarStyles();
  const { setIdsSharedSessionChat, isAlreadyHasDocument, setIsAlreadyHasDocument } = useChatStore();

  const windowSize = useWindowSize();
  const pathname = usePathname();
  const isLegalChatPage = pathname.startsWith('/legal-chat');
  const [showBtnCreate, setShowBtnCreate] = useState(false);
  const [conversationId] = useQueryState('c');
  const { resetBookmark } = useBookmarkContext();

  const [listSharedSession, setListSharedSession] = useState<ChatHistoryItem[]>([]);

  useEffect(() => {
    // close sidebar when width smaller than 640
    if (windowSize.width < 640) {
      // toggleSidebar(false);
    }

    // open sidebar when width bigger than 640
    if (windowSize.width >= 640) {
      toggleSidebar(true);
    }

    // open collapse when width smaller than 640 or bigger than 1024
    if (windowSize.width >= 640 && windowSize.width <= 1024) {
      toggleCollapse(true);
    }

    // close collapse when width from 640 to 1024
    if (windowSize.width >= 640 && windowSize.width <= 1024) {
      toggleCollapse(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowSize]);

  useEffect(() => {
    if (isLegalChatPage && conversationId) {
      setShowBtnCreate(true);
    } else {
      setShowBtnCreate(false);
    }
  }, [conversationId, isLegalChatPage]);

  const getSharedSessionChat = async () => {
    const session = await getSession();
    const rs = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/chats/history/legal?filter=share`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      },
    );
    if (rs.ok) {
      const response = await rs.json();
      if (response?.results) {
        setListSharedSession(response?.results);
        const ids = response?.results.map((item: ChatHistoryItem) => {
          return item.id;
        });
        setIdsSharedSessionChat(ids);
      }
    }
  };

  useEffect(() => {
    getSharedSessionChat();
  }, []);

  const resetIsAlreadyHasDocument = () => {
    if (isAlreadyHasDocument) {
      setIsAlreadyHasDocument(false);
    }
  };

  return (
    <Drawer
      type='inline'
      size='full'
      open={isOpenSidebar}
      className={classNames(sidebarStyles.root)}
    >
      <div
        className={classNames('flex h-full min-h-0 flex-col bg-color-screen-bg px-3', {
          '!w-20 text-center': isCollapsed,
          'w-full md:!w-60': !isCollapsed,
        })}
      >
        <div className='border-b border-b-neutrual-50 py-6'>
          <MenuItems />
        </div>

        <div className='chat-history mt-3 flex max-h-[calc(100vh-20.875rem)] grow flex-col pb-4'>
          <ConversationHistories listSharedSession={listSharedSession} />
        </div>
        <div className='absolute bottom-10 left-0 w-full px-2 py-5'>
          <div
            className={classNames('mb-6', {
              hidden: !showBtnCreate,
            })}
            onClick={() => resetBookmark()}
          >
            <Link href='/legal-chat'>
              {isCollapsed ? (
                <div className='m-auto flex w-fit justify-center rounded bg-aero-7 p-2 text-white'>
                  <EditIcon className='size-5' />
                </div>
              ) : (
                <Button
                  size='large'
                  appearance='primary'
                  className='w-full text-base font-semibold'
                  onClick={resetIsAlreadyHasDocument}
                >
                  <EditIcon className='mr-2 size-5' />
                  {!isCollapsed && 'New chat'}
                </Button>
              )}
            </Link>
          </div>
          <div
            className={classNames('absolute hidden w-full pb-5 sm:flex', {
              '!w-fit px-4': isCollapsed,
            })}
          >
            <Button
              className='collapse-btn'
              appearance='transparent'
              icon={isCollapsed ? <ArrowExport20Filled /> : <ArrowExportRtl20Filled />}
              onClick={() => toggleCollapse()}
            >
              {!isCollapsed && 'Collapse'}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default Sidebar;

Sidebar.displayName = 'Sidebar';
