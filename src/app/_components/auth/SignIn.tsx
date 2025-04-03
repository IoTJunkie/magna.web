'use client';

import { useState } from 'react';
import { Button, Field, Input } from '@fluentui/react-components';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SignInForm } from '@/app/types/auth';
import { EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import { useSpinner } from '@/contexts/SpinnerContext';
import TermAndPolicyDialog from '@/app/_components/term-policy-dialog';
import { STORAGE_ITEM_NAME } from '@/config';

const SignIn = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { showSpinner, hideSpinner } = useSpinner();
  const [isOpenTermAndPolicy, setIsOpenTermAndPolicy] = useState(false);

  const schema = yup
    .object({
      email: yup
        .string()
        .trim()
        .required('The Email address is required.')
        .email('Invalid email format. Please enter a valid email address.'),
      password: yup.string().required('The Password is required.'),
    })
    .required();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ email, password }: SignInForm) => {
    try {
      showSpinner();
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.ok) {
        const redirectSubsPage = localStorage.getItem(STORAGE_ITEM_NAME.subs_redirect);
        if (redirectSubsPage) {
          router.replace(`/settings/billing-subscription?highlight=${redirectSubsPage}`);
          localStorage.removeItem(STORAGE_ITEM_NAME.subs_redirect);
        } else {
          localStorage.setItem(STORAGE_ITEM_NAME.first_time_login, 'true');
          localStorage.removeItem(STORAGE_ITEM_NAME.tour_guide_finished);
          router.replace('/');
        }
      } else {
        setError('email', { message: `${result?.error}` });
      }
    } catch (error) {
    } finally {
      hideSpinner();
    }
  };

  const onAcceptTermAndPolicy = () => {
    handleSubmit(onSubmit)();
    setIsOpenTermAndPolicy(false);
  };

  return (
    <>
      <div className='pb-2 font-heading text-[2rem] font-semibold leading-[3.5rem] text-primary lg:text-5xl lg:font-bold'>
        Sign in
      </div>
      <div className='text-base leading-6 text-support'>
        Enter your details to login to your account.
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='pt-9 lg:pt-[3.375rem]'>
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

        <div className='pt-4 lg:pt-6'>
          <Field
            label='Password'
            validationState={errors.password ? 'error' : 'none'}
            validationMessage={
              errors.password?.message && (
                <div className='pt-2 font-sans text-xs text-red-1'>{errors.password?.message}</div>
              )
            }
            validationMessageIcon={null}
            className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
          >
            <Input
              {...register('password')}
              placeholder='Enter your Password'
              type={showPassword ? 'text' : 'password'}
              size='large'
              className='!text-sm'
              maxLength={128}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(onSubmit)()}
              contentAfter={
                showPassword ? (
                  <EyeOffRegular
                    aria-label='Show password'
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <EyeRegular
                    aria-label='Show password'
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )
              }
            />
          </Field>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-3 pt-4 text-sm'>
          <div>
            <p>
              By continuing, you agree with{' '}
              <span
                className='font-semibold leading-5 text-plg hover:cursor-pointer'
                onClick={() => setIsOpenTermAndPolicy(true)}
              >
                Legal Disclaimer
              </span>
            </p>
          </div>
          <div
            className='font-semibold leading-5 text-plg hover:cursor-pointer'
            onClick={() => router.push('/forgot-pwd')}
          >
            Forgot Password?
          </div>
        </div>

        <div className='pt-[2.75rem] lg:pt-16'>
          <Button
            type='button'
            className='w-full'
            onClick={handleSubmit(onSubmit)}
            appearance='primary'
            size='large'
          >
            Sign in
          </Button>
          <div className='py-3 text-center text-base text-neutrual-700 lg:py-5'>or</div>
          <Button className='w-full' size='large' onClick={() => router.push('/register')}>
            Register now
          </Button>
        </div>
      </form>

      <TermAndPolicyDialog
        open={isOpenTermAndPolicy}
        onClose={() => setIsOpenTermAndPolicy(false)}
        onAccept={onAcceptTermAndPolicy}
      />
    </>
  );
};

export default SignIn;

SignIn.displayName = 'SignIn';
