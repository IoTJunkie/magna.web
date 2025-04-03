import CustomIcon from '@/app/_components/common/CustomIcon';
import { useChatStore } from '@/app/_components/conversation/chat/chat-store';
import PencilIcon from '@/app/_components/icons/pencil-icon';
import { useProfileStore } from '@/app/_components/profile/profile-store';
import { ChatSessionHistory } from '@/app/api/__generated__/api';
import useToastComponent from '@/app/hooks/Toast';
import { useOutsideClick } from '@/app/utils/useOutsideClick';
import {
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuProps,
  MenuTrigger,
} from '@fluentui/react-components';
import axios from 'axios';
import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import Bookmarks from '../bookmarks';

type Props = {
  item: ChatSessionHistory;
  conversationId: string | null;
  styles: any;
  onSelectHistory: (id: string, policy?: string) => void;
  isCollapsed: boolean;
  isPolicyIdPage: boolean;
  isCaseIdPage: boolean;
  onDeleteClick: () => void;
  onOpenActionMenu: (item: ChatSessionHistory) => void;
  refetchHistories: () => void;
  onShareHistory: () => void;
  isSharedBookMark: boolean;
};

const HistoryItem = (props: Props) => {
  const {
    item,
    conversationId,
    styles,
    onSelectHistory,
    isCollapsed,
    isPolicyIdPage,
    isCaseIdPage,
    onDeleteClick,
    onOpenActionMenu,
    refetchHistories,
    onShareHistory,
    isSharedBookMark,
  } = props;
  const isActive = (id?: string) => {
    return conversationId === id;
  };
  const { idsSharedSessionChat } = useChatStore();
  const { profileInfo } = useProfileStore();
  const currentPath = window.location.pathname;

  const [isOpenActionsMenu, setIsOpenActionsMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRenameLoading, setIsRenameLoading] = useState(false);
  const { data: session } = useSession();
  const [msg, setMsg] = useState<JSX.Element | string>('');

  const { showToast, setIntent, toasterComponent } = useToastComponent({
    content: msg,
  });

  const handleOpenChange: MenuProps['onOpenChange'] = (e, data) => {
    setIsOpenActionsMenu(data.open || false);
  };

  const onRenameClick = () => {
    setIsEditing(true);
  };

  const onDownloadClick = async () => {
    try {
      let params: any = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/chats/${item.id}/session/download/`,
        params,
      );
      if (response.ok) {
        const blob = await response.blob();
        const newBlob = new Blob([blob]);
        const blobUrl = window.URL.createObjectURL(newBlob);
        const link = document.createElement('a');

        link.href = blobUrl;
        link.setAttribute('download', `${item.name}.zip`);

        document.body.appendChild(link);
        link.click();

        link.remove();
      } else {
        const res = await response.json();
        setIntent('error');
        setMsg(`${res.error}`);
        showToast();
      }
    } catch (error) {}
  };

  const [inputValue, setInputValue] = useState<string>(item.name || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isEditing]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setInputValue(event.target.value);
  };

  const onSubmit = useCallback(async () => {
    if (inputValue.trim() === item.name) {
      setIsEditing(false);
      return;
    }

    try {
      setIsRenameLoading(true);
      await axios.put(`/api/plg/chats/session/${item.id}/update/`, {
        name: inputValue.trim(),
      });
      setIsEditing(false);
      refetchHistories();
    } catch (error) {
      console.error(error);
    } finally {
      setIsRenameLoading(false);
    }
  }, [inputValue, item.id, item.name, refetchHistories]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }

    if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(item.name ?? '');
    }
  };

  useOutsideClick(inputContainerRef, () => {
    if (isEditing) {
      onSubmit(); // call onSubmit when clicked outside
    }
  });

  return (
    <>
      {!isEditing ? (
        <MenuItem
          key={item.id}
          className={classNames(
            '!bg-transparent !p-0 hover:!bg-transparent',
            styles.configMenuItem,
          )}
        >
          <div
            className={classNames(
              'group relative flex cursor-pointer items-center justify-between rounded-lg !px-2 transition-colors hover:!bg-bg-menu',
              {
                '!justify-center': isCollapsed,
              },
              {
                '!bg-bg-menu': isActive(item.id) || isOpenActionsMenu,
              },
              styles.menuItem,
            )}
            onClick={() => onSelectHistory(item.id || '', item?.case || item?.policy || '')}
          >
            {/* <div
              role='button'
              onClick={() => onSelectHistory(item.id || '', item?.case || item?.policy || '')}
              className='flex size-5 shrink items-center justify-center py-[0.625rem]'
            >
              {isActive(item.id) ? (
                isPolicyIdPage || isCaseIdPage ? (
                  isCaseIdPage ? (
                    <DiscoveryToolActiveIcon />
                  ) : (
                    <PolicyActiveIcon />
                  )
                ) : (
                  <MagnaActiveIcon />
                )
              ) : isPolicyIdPage || isCaseIdPage ? (
                isCaseIdPage ? (
                  <DiscoveryToolIcon />
                ) : (
                  <PolicyChatIcon />
                )
              ) : (
                <LegalChatIcon
                  className={classNames('text-text-support group-hover:!text-aero-8')}
                />
              )}
            </div> */}
            <div
              role='button'
              className={classNames('py-[0.625rem]', {
                hidden: isCollapsed,
              })}
            >
              <p
                className={classNames(
                  'relative h-5 max-w-72 grow overflow-hidden whitespace-nowrap font-medium group-hover:!text-aero-8 md:max-w-[11.25rem]',
                  {
                    'py-2.5': !item.name,
                  },
                )}
              >
                {item.name}
              </p>
              <div className='pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent'></div>
            </div>

            <Menu
              positioning='below-end'
              openOnHover={false}
              open={isOpenActionsMenu}
              onOpenChange={handleOpenChange}
            >
              <MenuTrigger disableButtonEnhancement>
                <div
                  className={classNames(
                    'absolute right-[0.375rem] hidden h-full w-5 rounded-r-lg bg-bg-menu pl-1',
                    {
                      '!block': isOpenActionsMenu || isActive(item.id),
                      'group-hover:block': !isOpenActionsMenu,
                    },
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenActionMenu(item);
                  }}
                >
                  <Image
                    src='/svg/three-dot-menu.svg'
                    width={12}
                    height={22}
                    alt=''
                    className='mt-5'
                  />
                  <div className='absolute right-5 top-0 h-full w-6 bg-gradient-to-l from-bg-menu to-transparent'></div>
                </div>
              </MenuTrigger>

              <MenuPopover className='!min-w-[10rem]'>
                <MenuList>
                  {!idsSharedSessionChat.includes(item?.id || '') && (
                    <MenuItem onClick={onRenameClick}>
                      <div className='flex items-center'>
                        <PencilIcon />
                        <span className='ml-1'>Rename</span>
                      </div>
                    </MenuItem>
                  )}
                  <MenuItem onClick={onDownloadClick}>
                    <div className='flex items-center'>
                      <CustomIcon name='download-chat' width={20} height={20} />
                      <span className='ml-1'>Download history</span>
                    </div>
                  </MenuItem>
                  {!idsSharedSessionChat.includes(item?.id || '') &&
                    !currentPath.includes('/policy-analyzer') &&
                    !currentPath.includes('/discovery-tool') && (
                      <MenuItem
                        onClick={onShareHistory}
                        className={classNames({
                          '!hidden':
                            profileInfo?.current_subscription === null ||
                            profileInfo?.current_subscription?.subscription_plan?.name === 'Plus',
                        })}
                      >
                        <div className='flex items-center'>
                          <CustomIcon name='share-history' width={20} height={20} />
                          <span className='ml-1'>Share</span>
                        </div>
                      </MenuItem>
                    )}
                  {!idsSharedSessionChat.includes(item?.id || '') && (
                    <MenuItem onClick={onDeleteClick}>
                      <div className='flex items-center'>
                        <Image src='/svg/trash-red.svg' width={20} height={20} alt='' />
                        <span className='ml-1 text-red-500'>Delete</span>
                      </div>
                    </MenuItem>
                  )}
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
          {isActive(item.id) && !isCollapsed && <Bookmarks isSharedBookmark={isSharedBookMark} />}
        </MenuItem>
      ) : (
        <div ref={inputContainerRef}>
          <Input
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className='w-full py-1'
            ref={inputRef}
            disabled={isRenameLoading}
          />
        </div>
      )}
      {toasterComponent}
    </>
  );
};

export default HistoryItem;
