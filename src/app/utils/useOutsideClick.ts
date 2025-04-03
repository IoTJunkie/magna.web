import { RefObject, useEffect } from 'react';

export function useOutsideClick(ref: RefObject<HTMLElement>, callback: () => void): void {
  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ref]); // Added dependencies
}
