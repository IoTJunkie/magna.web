'use client';

import Image from 'next/image';
import styles from './index.module.scss';
import { ThemeTypes } from '@/app/utils/multipleThemes';
import { useThemeContext } from '@/contexts/ThemeContext';
import { getSession } from 'next-auth/react';

const SwitchThemeButton = () => {
  const { theme, switchTheme, updateTheme } = useThemeContext();

  const handleThemeChange = async (theme: ThemeTypes) => {
    try {
      updateTheme(theme);
      const session = await getSession();
      const params = {
        theme: theme,
      };
      await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/user-theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify(params),
      });
    } catch (error) {}
  };

  return (
    <div className='flex flex-row items-center justify-between px-6 py-2'>
      <p>Change theme</p>
      <input
        type='checkbox'
        id='darkmode-toggle'
        className={styles.input}
        onChange={(v) => {
          switchTheme();
          handleThemeChange(v.target.checked ? ThemeTypes.DARK : ThemeTypes.LIGHT);
        }}
        checked={theme === ThemeTypes.DARK}
      ></input>
      <label className={styles.label} htmlFor='darkmode-toggle'>
        <Image
          className={`${styles.icon} ${styles.light}`}
          alt='light-mode-icon'
          src='/svg/sun-active.svg'
          width={28}
          height={28}
        />
        <Image
          className={`${styles.icon} ${styles.dark}`}
          alt='dark-mode-icon'
          src={theme === ThemeTypes.DARK ? '/svg/moon-active.svg' : '/svg/moon-inactive.svg'}
          width={28}
          height={28}
        />
      </label>
    </div>
  );
};

export default SwitchThemeButton;
