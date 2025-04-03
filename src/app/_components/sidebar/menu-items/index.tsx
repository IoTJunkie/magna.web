'use client';
import LegalChatIcon from '@/app/_components/icons/legal-chat-icon';
import PolicyChatIcon from '@/app/_components/icons/policy-chat-icon';
import { isEnableDiscoveryTool, isEnablePolicyAnalyzer } from '@/app/utils/checkEnableFeature';
import { useBookmarkContext } from '@/contexts/BookmarkContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { makeStyles, MenuItem, MenuList, shorthands, Tooltip } from '@fluentui/react-components';
import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useWindowSize } from 'usehooks-ts';
import { useChatStore } from '../../conversation/chat/chat-store';
import useChat from '../../conversation/chat/useChat';
import DiscoveryToolActiveIcon from '../../icons/discovery-tool-active-icon';
import DiscoveryToolIcon from '../../icons/discovery-tool-icon';
import MagnaActiveIcon from '../../icons/magna-active-icon';
import PolicyActiveIcon from '../../icons/policy-active-icon';
import { useProfileStore } from '../../profile/profile-store';

export const useMenuItems = (): {
  label: string;
  activeIcon: any;
  url: string;
  type: string;
  tooltip: string;
}[] => [
  {
    label: 'Magna AI',
    activeIcon: <MagnaActiveIcon />,
    url: '/legal-chat',
    type: 'legal',
    tooltip: 'New chat',
  },
  {
    label: 'Policy Pro',
    activeIcon: <PolicyActiveIcon />,
    url: '/policy-analyzer',
    type: 'policy',
    tooltip: 'New policy',
  },
  {
    label: 'Discovery Pro',
    activeIcon: <DiscoveryToolActiveIcon />,
    url: '/discovery-tool',
    type: 'discovery',
    tooltip: 'New discovery',
  },
];

const useMenuItemsStyles = makeStyles({
  root: {
    ...shorthands.padding('0'),
  },

  menuItem: {
    ...shorthands.padding('0'),
    maxWidth: 'none',
  },

  disabledMenuItem: {
    // Override default disabled styles to retain design
    opacity: 1,
    pointerEvents: 'none', // Disable interactions
    cursor: 'not-allowed', // Show 'not-allowed' cursor
    color: 'inherit', // Keep the text color
  },
});

const MenuItems = () => {
  const menuItems = useMenuItems();
  const styles = useMenuItemsStyles();
  const {
    createNewChatLoading,
    setIgnoreUpdateChatThread,
    refreshChatLoading,
    isAlreadyHasDocument,
    setIsAlreadyHasDocument,
  } = useChatStore();
  const { initBookmark } = useBookmarkContext();
  const { profileInfo } = useProfileStore();
  const { stopPostQuestion } = useChat();
  const [conversationId] = useQueryState('c', parseAsString);

  const pathname = usePathname();

  const isActive = (url: string) => {
    return pathname.includes(url);
  };

  const { isCollapsed, toggleSidebar } = useSidebar();

  const windowSize = useWindowSize();

  const onCloseSidebar = () => {
    // Clear bookmark
    initBookmark([], conversationId);
    if (createNewChatLoading || refreshChatLoading) {
      setIgnoreUpdateChatThread(true);
      stopPostQuestion();
    }
    if (windowSize.width > 640) {
      return;
    }
    toggleSidebar(false);
  };

  const resetIsAlreadyHasDocument = () => {
    if (isAlreadyHasDocument) {
      setIsAlreadyHasDocument(false);
    }
  };

  return (
    <MenuList className={classNames(styles.root)}>
      {menuItems.map((item) => {
        const isDisabled =
          (item.type === 'policy' && (!profileInfo || !isEnablePolicyAnalyzer(profileInfo))) ||
          (item.type === 'discovery' && (!profileInfo || !isEnableDiscoveryTool(profileInfo)));

        const menuItemContent = (
          <MenuItem
            disabled={isDisabled}
            className={classNames(styles.menuItem, {
              'pointer-events-none cursor-not-allowed text-inherit opacity-100': isDisabled,
            })}
          >
            <div
              className={classNames(
                'transition-colors hover:!bg-aero-2',
                {
                  '!bg-aero-2 font-semibold': isActive(item.url),
                  '!bg-color-screen-bg': !isActive(item.url),
                },
                'flex items-center justify-between rounded-lg px-2 py-3',
                {
                  '!text-aero-8': isActive(item.url),
                  '!justify-center': isCollapsed,
                },
              )}
              id='menu-item'
              onClick={resetIsAlreadyHasDocument}
            >
              <div
                className={classNames('flex w-full items-center justify-center', {
                  'policy-menu': item.type === 'policy',
                  'discovery-menu': item.type === 'discovery',
                  'legal-menu': item.type === 'legal',
                })}
              >
                <div className='flex shrink justify-center'>
                  {isActive(item.url) ? (
                    item.activeIcon
                  ) : (
                    <>
                      {item.type === 'legal' ? (
                        <LegalChatIcon
                          className={classNames('text-text-support group-hover:!text-aero-8')}
                        />
                      ) : item.type === 'policy' ? (
                        <PolicyChatIcon
                          className={classNames('text-text-support group-hover:!text-aero-8')}
                        />
                      ) : (
                        <DiscoveryToolIcon
                          className={classNames('text-text-support group-hover:!text-aero-8')}
                        />
                      )}
                    </>
                  )}
                </div>

                <div
                  className={classNames(
                    'ml-3 flex flex-1 items-center justify-between text-sm capitalize group-hover:text-aero-8',
                    {
                      hidden: isCollapsed,
                    },
                  )}
                >
                  {item.label}
                </div>
              </div>
            </div>
          </MenuItem>
        );

        return (
          <Link
            key={item.url}
            href={isDisabled ? '#' : item.url}
            onClick={(e) => {
              if (isDisabled) {
                e.preventDefault();
              } else {
                onCloseSidebar();
              }
            }}
            className='group w-full text-base font-medium'
          >
            {isDisabled && item.type === 'policy' ? (
              <Tooltip
                content='Please upgrade your plan to Policy Pro and above to access this feature'
                positioning='after'
                withArrow
                relationship={'description'}
              >
                {menuItemContent}
              </Tooltip>
            ) : isDisabled && item.type === 'discovery' ? (
              <Tooltip
                content='Please upgrade your plan to Esquire to access this feature'
                positioning='after'
                withArrow
                relationship={'label'}
              >
                {menuItemContent}
              </Tooltip>
            ) : (
              menuItemContent
            )}
          </Link>
        );
      })}
    </MenuList>
  );
};

export default MenuItems;

MenuItems.displayName = 'MenuItems';
