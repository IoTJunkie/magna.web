'use client';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

type Step = 'Uploading' | 'Uploaded';

export const useUploadDiscovery = (url: string) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [intervalExtract, _setIntervalExtract] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('Uploading');

  const uploadForm = async (formData: FormData) => {
    try {
      setIsLoading(true);
      setProgress(0);
      setError(null);

      const session = await getSession();
      const res = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        onUploadProgress: (progressEvent: any) => {
          let percentComplete = Math.floor(progressEvent.loaded / progressEvent!.total);
          setProgress(percentComplete);
        },
      });
      console.log('res---->', res);

      if (res.status >= 200 && res.status < 300) {
        setStep('Uploaded');
        if (Array.isArray(res.data))
          throw {
            response: {
              data: [res.data],
            },
          };
      }
    } catch (error: any) {
      console.log('error upload--->', error);
      setError(
        error.response?.data[0] ||
          error.response?.data.detail ||
          'An error occurred during document processing. Please Try Again',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetStates = () => {
    setIsSuccess(false);
    setProgress(0);
    setError(null);
  };

  return { uploadForm, isSuccess, progress, isLoading, error, step, resetStates };
};
