'use client';

import { Button, Field, Input } from '@fluentui/react-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ForgotPwdForm } from '@/app/types/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/contexts/SpinnerContext';

const ForgotPwd = () => {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showSpinner, hideSpinner } = useSpinner();

  const schema = yup.object({
    email: yup
      .string()
      .trim()
      .required('The Email address is required.')
      .email('Invalid email format. Please enter a valid email address.'),
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPwdForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPwdForm) => {
    try {
      showSpinner();
      const params: ForgotPwdForm = { ...data, base_url: process.env.NEXT_PUBLIC_WEB_DOMAIN };
      const response = await fetch('/api/auth/forgot-pwd', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      const res = await response.json();
      if (res.detail) {
        setIsSubmitted(true);
      } else {
        setError('email', { message: res.error || JSON.stringify(res) });
      }
    } catch (error) {
    } finally {
      hideSpinner();
    }
  };

  return (
    <>
      {isSubmitted ? (
        <>
          <div className='pb-2 font-heading text-[2rem] font-semibold leading-[3.5rem] text-primary lg:text-5xl lg:font-bold'>
            Check your email!
          </div>
          <div className='text-base leading-6 text-support'>
            Reset link has been sent to your email.
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
      ) : (
        <>
          <div className='pb-2 font-heading text-[2rem] font-semibold leading-[3.5rem] text-primary lg:text-5xl lg:font-bold'>
            Forgot password
          </div>
          <div className='text-base leading-6 text-support'>
            Please enter your email address. We will send you an email to reset your password.
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className='pt-9 lg:pt-[3.375rem]' noValidate>
            {/* Email address */}
            <div>
              <Field
                label='Email address'
                validationState={errors.email ? 'error' : 'none'}
                validationMessage={
                  errors.email?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>{errors.email?.message}</div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('email')}
                  placeholder='Enter your Email address'
                  size='large'
                  className='!text-sm'
                  maxLength={254}
                />
              </Field>
            </div>

            {/* Action */}
            <div className='pt-[2.75rem] lg:pt-16'>
              <Button type='submit' className='w-full' appearance='primary' size='large'>
                Confirm
              </Button>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default ForgotPwd;

ForgotPwd.displayName = 'ForgotPwd';
