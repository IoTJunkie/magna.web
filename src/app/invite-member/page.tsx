'use client';
import Logo from '@/app/_components/logo';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';
import { ThemeTypes } from '@/app/utils/multipleThemes';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@fluentui/react-components';
import InviteMemberValidLink from '../_components/invite-member/InivteMemberValidLink';

const InviteMember = () => {
  const { theme } = useThemeContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const params = useSearchParams();
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(false);
  const token = params.get('token');

  const handleLinkInviteMember = async () => {
    try {
      setLoading(true);
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/invitation-link-status?token=${token}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const res = await response.json();
        if (res.message === 'New user') {
          router.push(`/register?token=${token}`);
        } else {
          localStorage.setItem('inviteMemberToken', token ?? '');
          router.push('/');
          return;
        }
      } else {
        setIsLinkExpired(true);
        setLoading(false);
      }
    } catch (error) {
      console.log('error', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLinkInviteMember();
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
            <InviteMemberValidLink isLinkExpired={isLinkExpired} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteMember;
