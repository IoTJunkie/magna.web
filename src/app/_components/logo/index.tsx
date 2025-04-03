'use client';

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { useThemeContext } from '@/contexts/ThemeContext';
import { ThemeTypes } from '@/app/utils/multipleThemes';

const Logo = () => {
  const { theme } = useThemeContext();

  return (
    <Link href='/'>
      <Image
        src={theme === ThemeTypes.DARK ? '/svg/logo-dark.svg' : '/svg/logo-light.svg'}
        alt='logo'
        width={98}
        height={48}
        priority
      />
    </Link>
  );
};

export default Logo;

Logo.displayName = 'Logo';
