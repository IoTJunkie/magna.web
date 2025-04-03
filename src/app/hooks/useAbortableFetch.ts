import { useCallback, useEffect, useRef } from 'react';

// 🪝 Custom hook to manage abortable fetch requests
export default function useAbortableFetch() {
  // 🚦 A ref to hold the AbortController instance
  const abortController = useRef<AbortController | undefined>();

  // ✋ Function to abort the fetch request, wrapped in useCallback to ensure
  // it doesn't change and cause re-renders unnecessarily.
  const abortFetch = useCallback(() => {
    abortController?.current?.abort(); // 🛑 Signal the abort!
  }, []);

  // 🧹 Effect to clean up and abort any ongoing fetches when the component unmounts
  // This helps prevent setting state on an unmounted component if the fetch resolves
  // after the component has already unmounted - a classic React pitfall!
  useEffect(() => {
    return () => {
      abortFetch(); // 🛑 Auto-abort on unmount!
    };
  }, [abortFetch]);

  // 🕵️‍♂️ Function to check if an error is specifically an AbortError, indicating
  // that the fetch was aborted. Wrapped in useCallback to ensure stability.
  const isAbortError = useCallback((error: unknown): boolean => {
    // Instanceof check to see if this error is a DOMException and named 'AbortError'
    return error instanceof DOMException && error.name === 'AbortError';
  }, []);

  useEffect(() => {
    abortController.current = new AbortController();
  }, []);

  // 📦 Pack and send the abort signal, abort function, and abort error checker
  return { abortSignal: abortController?.current?.signal, abortFetch, isAbortError };
}
