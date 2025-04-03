'use client';
import { Bookmark, useBookmarkContext } from '@/contexts/BookmarkContext';
import BookmarkComponent from './Bookmark';

type Props = {
  isSharedBookmark: boolean;
};
const Bookmarks = ({ isSharedBookmark }: Props) => {
  const { bookmarks } = useBookmarkContext();

  return (
    <div className='mt-1 flex max-h-[11.75rem] flex-col gap-[0.125rem] overflow-hidden rounded pr-[0.375rem] hover:overflow-auto'>
      {bookmarks.map((bookmark: Bookmark) => (
        <BookmarkComponent
          bookmark={bookmark}
          key={bookmark.id}
          isSharedBookmark={isSharedBookmark}
        />
      ))}
    </div>
  );
};
export default Bookmarks;
