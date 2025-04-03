'use client';
import { ThemeTypes } from '@/app/utils/multipleThemes';
import { useThemeContext } from '@/contexts/ThemeContext';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';

type Props = {
  title: string;
  description: string;
  type: 'dashboard' | 'legal-chat' | 'policy-analyzer';
  legalChat?: boolean;
};

const IntroduceSection = ({ description, type = 'dashboard', title, legalChat = false }: Props) => {
  const { theme } = useThemeContext();

  const getSvgUrl = () => {
    const svgUrls = {
      dashboard: '/svg/welcome-chat.svg',
      'legal-chat': theme === ThemeTypes.DARK ? '/svg/logo-dark.svg' : '/svg/logo-light.svg',
      'policy-analyzer': '/svg/policy-analyzer-vector.svg',
    };
    return svgUrls[type];
  };

  return (
    <div className='mx-auto mt-10'>
      <div className='relative mx-auto hidden aspect-video h-fit md:flex md:max-w-[17.5rem] xl:max-w-xs 2xl:max-w-sm'>
        <Image src={getSvgUrl()} priority fill alt='' />
      </div>
      <h1
        className={classNames(
          'text-center font-heading text-[2rem] font-semibold leading-10 tracking-[0.03125rem] text-neutrual-900 md:mt-5 md:text-[2.75rem] lg:leading-tight 2xl:text-5xl',
          {
            'md:hidden': legalChat,
          },
        )}
      >
        {title}
      </h1>
      <p className='mt-5 text-center text-text-support md:mt-3 xl:text-base 2xl:mt-6'>
        {legalChat ? (
          <>
            Find the <span className='font-bold'>needle</span>, skip the
            <span className='font-bold'> haystack</span>
          </>
        ) : (
          <> {description}</>
        )}
      </p>
    </div>
  );
};

export default IntroduceSection;

IntroduceSection.displayName = 'IntroduceSection';
