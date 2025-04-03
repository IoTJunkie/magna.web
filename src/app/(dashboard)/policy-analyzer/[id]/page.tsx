'use client';
import Chat from '@/app/_components/conversation/chat';
import EyeViewPolicyDoc from '@/app/_components/icons/eye-view-policy-doc';
import { PolicyMobileTabs } from '@/app/_components/policy-analyzer/mobile-tabs';
import PolicyRightPanel from '@/app/_components/policy-analyzer/policy-right-panel';
import useCancelToken from '@/app/hooks/useCancelToken';
import { getFileType } from '@/app/utils';
import { FILE_TYPE_ALLOWED_SHOW_PAGE } from '@/config';
import axios from 'axios';
import classNames from 'classnames';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

type Props = {
  params: { id: string };
};

const PolicyDetails = (props: Props) => {
  const { params } = props;
  const router = useRouter();
  const [policySummary, setPolicySummary] = useState(null);
  const { cancelToken } = useCancelToken();
  const [isActiveViewFile, setIsActiveViewFile] = useState(false);
  const [icon, setIcon] = useState<string | null>(null);

  // const { data: policySummary, isLoading: policySummaryLoading } = useQuery(
  //   ['policies', params.id, 'summary'],
  //   getPolicySummary,
  // );

  const getPolicy = async () => {
    try {
      const searchParams = new URLSearchParams({
        page: '1',
      });

      const url = `/api/plg/policies/${params.id}/?${searchParams.toString()}`;
      const response = await axios.get(url, { cancelToken: cancelToken });

      return response.data;
    } catch (error) {
      if ((error as any)?.code === 'ERR_BAD_RESPONSE') router.push('/policy-analyzer');
      console.log('error :>> ', error);
    }
  };

  const { data: policy, isLoading: policyLoading } = useQuery(['policies', params.id], getPolicy);

  const isAllowToShowPage = FILE_TYPE_ALLOWED_SHOW_PAGE.includes(
    policy?.documents[0]?.name.split('.').pop(),
  );

  useEffect(() => {
    if (policy && policy?.documents.length) {
      setIcon(getFileType(policy?.documents[0]?.url));
    }
  }, [policy]);

  useEffect(() => {
    const getPolicySummary = async () => {
      try {
        const url = `/api/plg/policies/${params.id}/summary/`;
        const response = await axios.get(url, { cancelToken: cancelToken });

        setPolicySummary(response.data);
      } catch (error) {
        console.log('error :>> ', error);
      }
    };

    if (policy?.summary) {
      getPolicySummary();
    }
  }, [cancelToken, params.id, policy]);

  return (
    <>
      <div className='hidden h-full md:flex'>
        <div className='flex size-full flex-1 flex-col md:w-3/5'>
          {policy?.name && (
            <div className='flex justify-between break-words border-b-[0.0625rem] p-9 align-middle text-drover-9'>
              <div className='flex flex-wrap gap-3'>
                {!!icon && (
                  <div>
                    <Image src={`/svg/${icon}-policy.svg`} width={24} height={24} alt='file icon' />
                  </div>
                )}
                <div>
                  {' '}
                  <div className='w-fit min-w-[12.5rem] max-w-[21.875rem] truncate text-[1.125rem] font-semibold'>
                    {policy?.name}
                  </div>
                  {isAllowToShowPage &&
                    policy?.documents?.length &&
                    policy?.documents[0]?.total_pages && (
                      <div className='mt-1 text-sm'>{`${policy?.documents[0]?.total_pages} ${policy?.documents[0]?.total_pages > 1 ? 'pages' : 'page'}`}</div>
                    )}
                </div>
              </div>
              <div
                className={classNames(
                  'flex items-center gap-2 whitespace-nowrap text-base font-semibold',
                  {
                    'cursor-pointer text-[#418C61]': !isActiveViewFile,
                    'cursor-not-allowed text-[#ABABB1]': isActiveViewFile,
                  },
                )}
                onClick={() => {
                  setIsActiveViewFile(true);
                }}
              >
                <EyeViewPolicyDoc active={isActiveViewFile} />
                View file
              </div>
            </div>
          )}
          <Chat />
        </div>

        <div className='lg:w-2/5'>
          <PolicyRightPanel
            {...{
              policySummary,
              policy,
              isLoading: policyLoading,
              isActiveViewFile,
              setIsActiveViewFile: setIsActiveViewFile,
              setPolicySummary: setPolicySummary,
            }}
          />
        </div>
      </div>

      <PolicyMobileTabs {...{ policySummary, policy, setPolicySummary: setPolicySummary }} />
    </>
  );
};

export default PolicyDetails;

PolicyDetails.displayName = 'PolicyDetails';
