'use client';
import Logo from '@/app/_components/logo';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import InterrogativeQuestionForm from '../../../_components/discovery-tool/question-form/InterrogativeQuestionForm';
import { useThemeContext } from '@/contexts/ThemeContext';
import { ThemeTypes } from '@/app/utils/multipleThemes';
import { useParams } from 'next/navigation';
import { Spinner } from '@fluentui/react-components';
import { getSession } from 'next-auth/react';

const QuestionForm = () => {
  const { theme } = useThemeContext();
  const [loading, setLoading] = useState(true);
  const [questionDetail, setQuestionDetail] = useState<string>('');
  const params = useParams();
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(false);
  const { question_id, otp } = params;

  const handleGetContentQuestion = async () => {
    try {
      setLoading(true);
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/questions/public/${question_id}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const res = await response.json();
        setQuestionDetail(res.question_detail);
      } else {
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkExpired = async () => {
    try {
      const session = await getSession();
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/questions/${question_id}/client-answer/${otp}/status`;
      const rs = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      if (rs.ok) {
        handleGetContentQuestion();
      } else {
        setIsLinkExpired(true);
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLinkExpired();
  }, []);

  return (
    <div className='flex min-h-screen w-full bg-plg-bg px-6 py-14 md:items-center md:p-8 lg:p-16'>
      {loading ? (
        <Spinner className='!mx-auto' size='tiny' />
      ) : (
        <div className='grid w-full grid-cols-12 grid-rows-[0fr,1fr] gap-2 md:min-h-[calc(100vh-8rem)] md:grid-rows-none'>
          <div className='col-span-12 md:col-span-5'>
            <div className='flex items-baseline gap-4 text-aero-9 lg:gap-6'>
              <Logo />
              <div className='text-sm font-normal lg:text-base'>/A team committed to success</div>
            </div>
            <div className='hidden h-4/5 md:block lg:pt-[30%]'>
              <Image
                alt='MAGNA Banner'
                className='size-full object-contain'
                src={theme === ThemeTypes.DARK ? '/svg/banner-dark.svg' : '/svg/banner.svg'}
                width='0'
                height='0'
                priority
              />
            </div>
          </div>

          <div className='col-span-12 m-auto flex h-auto w-full max-w-[33rem] justify-center rounded-[0.75rem] border-[0.0625rem] bg-white p-[1.5rem_2rem] shadow-[0_0_1.875rem_0_rgba(0,0,0,0.1)] md:col-span-7 '>
            <InterrogativeQuestionForm
              isLinkExpired={isLinkExpired}
              questionDetail={questionDetail}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;
