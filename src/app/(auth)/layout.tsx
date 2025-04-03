'use client';

import { useThemeContext } from '@/contexts/ThemeContext';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect } from 'react';
import Logo from '../_components/logo';
import { ThemeTypes } from '../utils/multipleThemes';
import classes from './index.module.scss';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useThemeContext();

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      // if (session) return redirect('/');
      if (session) return window.open('/', '_self');
    };
    fetchData();
  }, []);

  return (
    <div className='flex min-h-screen w-full bg-plg-bg px-6 py-14 md:items-center md:p-8 lg:p-16'>
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

        <div className={classes.content}>
          <div className='flex w-full flex-col justify-center'>{children}</div>
        </div>
      </div>
    </div>
  );
}
