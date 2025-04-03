import { createContext, PropsWithChildren, useContext, useState } from 'react';

export interface Bookmark {
  id: string;
  name?: string;
}

interface BookmarkContextType {
  conversationId: string | null;
  bookmarks: Bookmark[];
  clickedBookmark: Bookmark | undefined;
  initBookmark: (bookmarks: Bookmark[], conversationId: string | null) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  renameBookmark: (id: string, newName: string) => void;
  onClickBookmark: (bookmark: Bookmark | undefined) => void;
  resetBookmark: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarkContext = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarkContext must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ children }: PropsWithChildren) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [clickedBookmark, setClickedBookmark] = useState<Bookmark | undefined>();

  const initBookmark = (bookmarks: Bookmark[], conversationId: string | null) => {
    setBookmarks([]);
    setClickedBookmark(undefined);
    setBookmarks(bookmarks);
    setConversationId(conversationId);
  };

  const onClickBookmark = (bookmark: Bookmark | undefined) => {
    setClickedBookmark(bookmark);
  };

  const addBookmark = (bookmark: Bookmark) => {
    setBookmarks((prevBookmarks) => [...prevBookmarks, bookmark]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prevBookmarks) => prevBookmarks.filter((bookmark) => bookmark.id !== id));
  };

  const resetBookmark = () => {
    setBookmarks([]);
  };

  const renameBookmark = (id: string, newName: string) => {
    setBookmarks((prevBookmarks) =>
      prevBookmarks.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, name: newName } : bookmark,
      ),
    );
  };

  return (
    <BookmarkContext.Provider
      value={{
        conversationId,
        bookmarks,
        clickedBookmark,
        addBookmark,
        removeBookmark,
        renameBookmark,
        initBookmark,
        onClickBookmark,
        resetBookmark,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

BookmarkContext.displayName = 'BookmarkContext';
