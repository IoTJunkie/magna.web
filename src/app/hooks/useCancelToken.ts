import axios, { type CancelTokenSource } from 'axios';
import { useCallback, useEffect, useRef } from 'react';

// Custom hook that returns a cancel token and a function to cancel the requests
export default function useCancelToken() {
  const cancelTokenSource = useRef<CancelTokenSource | undefined>();

  // Function to cancel all ongoing requests using the token
  // Wrapped with useCallback to memoize the function across re-renders
  const cancelRequests = useCallback(() => {
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('Operation canceled by the user.');
    }
  }, []);

  // Automatically cancel all requests when the component unmounts
  useEffect(() => {
    return () => {
      cancelRequests();
    };
  }, [cancelRequests]);

  useEffect(() => {
    cancelTokenSource.current = axios.CancelToken.source();
  }, []);

  // Return the token to be used in requests, the cancel function, and the isCancel function
  return {
    cancelToken: cancelTokenSource?.current?.token,
    cancelRequests,
    isCancelToken: axios.isCancel,
  };
}
