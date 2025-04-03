'use client';

import { Button } from '@fluentui/react-components';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const VerifyEmail = () => {
  const router = useRouter();
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const response = await fetch(`/api/auth/verify-email?uidb64=${uidb64}&token=${token}`, {
        method: 'GET',
      });
      const res = await response.json();
      if (res.detail) {
        setMsg('Your account has been verified!');
      } else {
        setMsg('Verify link has been expired!');
      }
    };

    if (uidb64 && token) verifyEmail();
  }, []);

  return (
    <>
      <div className='pb-2 font-heading text-[2rem] font-semibold leading-[3.5rem] text-primary lg:text-5xl lg:font-bold'>
        {msg}
      </div>
      <div className='pt-[2.75rem] lg:pt-16'>
        <Button
          type='submit'
          className='w-full'
          appearance='primary'
          size='large'
          onClick={() => router.push('/signin')}
        >
          Back to Login
        </Button>
      </div>
    </>
  );
};
export default VerifyEmail;

VerifyEmail.displayName = 'VerifyEmail';
