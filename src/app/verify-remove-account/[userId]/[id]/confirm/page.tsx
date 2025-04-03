'use client';
import Logo from '@/app/_components/logo';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';
import { ThemeTypes } from '@/app/utils/multipleThemes';
import { usePathname, useRouter } from 'next/navigation';
import DeleteAccountMessage from '../../../../_components/delete-account-message';
import { ApiDeleteStatus } from '@/config';
import { Spinner } from '@fluentui/react-components';
import { getSession, signOut } from 'next-auth/react';

const DeleteAccountConfirm = () => {
  const { theme } = useThemeContext();
  const pathName = usePathname();
  const userId = pathName.split('/').at(2);
  const token = pathName.split('/').at(3);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let timeOutId: any;
    const handleDeleteAccount = async () => {
      const session = await getSession();
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/verify-remove-account/${userId}/${token}/confirm/`,
        );
        if (res.status >= 200 && res.status <= 300) {
          setStatus(ApiDeleteStatus.SUCCCESS);
          setIsLoading(false);
          timeOutId = setTimeout(async () => {
            if (session?.user?.access_token) {
              await signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/` });
              router.push('/signin');
            } else {
              router.push('/signin');
            }
          }, 3000);
        } else {
          const data = await res.json();
          if ((data.detail = 'Your account removed!')) {
            router.push('/signin');
          } else {
            setStatus(ApiDeleteStatus.FAILURE);
            setIsLoading(false);
          }
        }
      } catch (err) {
        setIsLoading(false);
        console.log(err);
      }
    };
    handleDeleteAccount();
    // timeOutId = setTimeout(async () => {
    //     // const result = await signOut({ callbackUrl: process.env.NEXT_PUBLIC_WEB_DOMAIN } );
    //     // console.log(result);
    //     router.push('/signin');
    // }, 3000);
    // return () => clearTimeout(timeOutId);
  }, []);

  return (
    <div className='flex min-h-screen w-full bg-plg-bg px-6 py-14 md:items-center md:p-8 lg:p-16'>
      <div className='grid w-full grid-cols-12 grid-rows-[0fr,1fr] gap-2 md:min-h-[calc(100vh-8rem)] md:grid-rows-none'>
        <div className='col-span-12 md:col-span-5'>
          <div className='flex items-baseline gap-4 text-aero-9 lg:gap-6'>
            <Logo />
            <div className='text-sm font-normal lg:text-base'>/A team committed to success</div>
          </div>
          <div className='hidden h-4/5 md:block lg:pt-[15%]'>
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
        {isLoading ? (
          <div className='col-span-12 flex size-full items-center justify-center md:col-span-5'>
            <Spinner label='Loading...' />
          </div>
        ) : (
          <div className='col-span-12 m-auto flex h-auto w-full max-w-[33rem] justify-center rounded-[0.75rem] border-[0.0625rem] bg-white p-[1.5rem_2rem] shadow-[0_0_1.875rem_0_rgba(0,0,0,0.1)] md:col-span-7 '>
            <DeleteAccountMessage status={status} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountConfirm;
