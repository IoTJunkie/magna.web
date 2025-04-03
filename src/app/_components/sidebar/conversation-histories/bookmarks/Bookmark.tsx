import { Bookmark, useBookmarkContext } from '@/contexts/BookmarkContext';
import {
  Input,
  InputOnChangeData,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuProps,
  MenuTrigger,
} from '@fluentui/react-components';
import { Bookmark24Regular } from '@fluentui/react-icons';
import { ChangeEvent, useRef, useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import { useOutsideClick } from '@/app/utils/useOutsideClick';
import { useWindowSize } from 'usehooks-ts';
import { useSidebar } from '@/contexts/SidebarContext';
import PencilIcon from '@/app/_components/icons/pencil-icon';
import { escapedId } from '@/app/utils';

type Props = {
  bookmark: Bookmark;
  isSharedBookmark: boolean;
};
const BookmarkComponent = (props: Props) => {
  const { bookmark, isSharedBookmark } = props;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { onClickBookmark, removeBookmark, renameBookmark } = useBookmarkContext();

  const [inputValue, setInputValue] = useState<string>(bookmark.name || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const { toggleSidebar } = useSidebar();

  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 640;

  const onCloseSidebar = () => {
    if (!isMobile) {
      return;
    }
    toggleSidebar(false);
  };

  const onOpenChange: MenuProps['onOpenChange'] = (e, data) => {
    e.stopPropagation();
    setOpen(data.open);
  };

  const onRenameClick = () => {
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  };

  const onRemoveBookmark = async () => {
    try {
      await fetch(`/api/plg/chats/session/chat/${bookmark.id}/bookmark/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked: false }),
      });
      removeBookmark(bookmark.id);
    } catch (error) {}
  };

  const goToBookmarkById = (id: string) => {
    const elms = document.querySelectorAll(`.${escapedId(id)}`);

    if (elms.length) {
      const elm = isMobile ? elms[elms.length - 1] : elms[0];
      elm.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const onSelectBookmark = () => {
    onCloseSidebar();
    onClickBookmark(bookmark);
    setTimeout(() => {
      goToBookmarkById(bookmark.id);
    }, 100);
  };

  const onRenameBookmark = async () => {
    if (inputValue.trim() === bookmark.name) {
      setEditing(false);
      return;
    }

    try {
      setLoading(true);
      await fetch(`/api/plg/chats/session/chat/${bookmark.id}/bookmark/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmark_name: inputValue.trim() }),
      });

      setEditing(false);
      renameBookmark(bookmark.id, inputValue);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useOutsideClick(inputContainerRef, () => {
    if (editing) {
      onRenameBookmark(); // call onRenameBookmark when clicked outside
    }
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    setInputValue(data.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onRenameBookmark();
    }
    if (e.key === 'Escape' || e.key === 'Esc') {
      setEditing(false);
      setInputValue(`${bookmark.name}`);
    }
    if (e.code === 'Space') {
      e.preventDefault();
      e.stopPropagation();
      setInputValue(`${inputValue}${e.key}`);
    }
  };

  return (
    <>
      {editing ? (
        <>
          <div ref={inputContainerRef}>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className='w-full py-1'
              disabled={loading}
            />
          </div>
        </>
      ) : (
        <div
          className='group relative flex rounded-lg bg-bg-menu px-2 py-[0.625rem]'
          onClick={onSelectBookmark}
        >
          <Bookmark24Regular className='size-5 hover:text-aero-8' />
          <p className='max-w-72 overflow-hidden whitespace-nowrap pl-3 font-medium group-hover:!text-aero-8 md:max-w-[9.6875rem]'>
            {bookmark.name}
          </p>
          <div className='pointer-events-none absolute right-0 top-0 h-full w-6 rounded-lg bg-gradient-to-l from-bg-menu to-transparent'></div>
          {!isSharedBookmark && (
            <div
              className={classNames(
                'absolute right-[0.375rem] top-0 hidden h-full w-5 rounded-r-lg bg-bg-menu pl-1',
                {
                  'group-hover:block': !open,
                  '!block': open,
                },
              )}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              <Image src='/svg/three-dot-menu.svg' width={12} height={22} alt='' className='mt-5' />
              <div className='absolute right-5 top-0 h-full w-6 bg-gradient-to-l from-bg-menu to-transparent'></div>
            </div>
          )}
          <Menu positioning='below-end' openOnHover={false} open={open} onOpenChange={onOpenChange}>
            <MenuTrigger disableButtonEnhancement>
              <div className='invisible w-0'></div>
            </MenuTrigger>

            <MenuPopover className='!min-w-[10rem]'>
              <MenuList>
                <MenuItem onClick={onRenameClick}>
                  <div className='flex items-center'>
                    <PencilIcon />
                    <span className='ml-1'>Rename</span>
                  </div>
                </MenuItem>

                <MenuItem onClick={onRemoveBookmark}>
                  <div className='flex items-center'>
                    <Image src='/svg/trash-red.svg' width={20} height={20} alt='' />
                    <span className='ml-1 text-red-500'>Remove</span>
                  </div>
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      )}
    </>
  );
};
export default BookmarkComponent;
