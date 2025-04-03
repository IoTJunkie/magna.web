'use client';

import { Spinner } from '@fluentui/react-components';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const MyCase = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authorizationCode = searchParams.get('code');
    console.log('authorization', authorizationCode);
    if (authorizationCode) {
      localStorage.setItem('authMycaseCode', authorizationCode);
      window.close();
    }
  }, [searchParams]);

  return (
    <div className='flex size-full items-center justify-center'>
      <Spinner />
    </div>
  );
};
export default MyCase;

MyCase.displayName = 'MyCase';
