'use client';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

type Step = 'Uploading' | 'Extracting';

export const useUploadForm = (url: string) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [intervalExtract, _setIntervalExtract] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('Uploading');
  const [policyId, setPolicyId] = useState(null);

  useEffect(() => {
    let intervalId: any = null;
    if (policyId) {
      intervalId = setInterval(async () => {
        const session = await getSession();
        setStep('Extracting');
        setProgress(0.8);
        let params: any = {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        };
        const res = await axios.get(
          `/api/plg/policies/${policyId}/text-extraction-status/`,
          params,
        );
        if (res.status >= 200 && res.status < 300 && res.data.status) {
          clearInterval(intervalExtract);
          setIsSuccess(true);
          setProgress(1);
        }
      }, 3000);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [policyId]);

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
        onUploadProgress: () => {
          setProgress(0.4);
        },
      });
      if (res.status >= 200 && res.status < 300) {
        if (Array.isArray(res.data))
          throw {
            response: {
              data: [res.data],
            },
          };

        setPolicyId(res.data.policy_id);
      }
    } catch (error: any) {
      setError(
        error.response?.data[0] ||
          error.response?.data?.detail ||
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
