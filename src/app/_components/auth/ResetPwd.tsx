'use client';

import { Button, Field, Input } from '@fluentui/react-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ResetPwdForm } from '@/app/types/auth';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSpinner } from '@/contexts/SpinnerContext';
import { EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import useToastComponent from '@/app/hooks/Toast';

const ResetPwd = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showCfPassword, setShowCfPassword] = useState(false);
  const { showSpinner, hideSpinner } = useSpinner();
  const pwdRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;
  const [successMsg, setSuccessMsg] = useState<JSX.Element | string>('');
  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: successMsg,
  });
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();

  const schema = yup.object({
    new_password_1: yup
      .string()
      .required('The New password is required.')
      .matches(
        pwdRegex,
        'Password must be at least 8 characters and contains lowercases, uppercases, numbers and special characters',
      ),
    new_password_2: yup
      .string()
      .required('The Confirm new password is required.')
      .test(
        'passwords-match',
        'Passwords do not match. Please ensure that the password and confirm password fields match.',
        function (value, context) {
          return !!value && context.parent.new_password_1 === value;
        },
      ),
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPwdForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ResetPwdForm) => {
    try {
      showSpinner();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/reset-password/${uidb64}/${token}/confirm/`,
        {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      const res = await response.json();
      if (response.ok) {
        setIntent('success');
        setSuccessMsg(res.detail);
        showToast();
        setTimeout(() => {
          router.replace('/signin');
        }, 1000);
      } else {
        setIntent('error');
        setSuccessMsg(res.errors[0]);
        showToast();
      }
    } catch (error) {
    } finally {
      hideSpinner();
    }
  };

  return (
    <>
      <div className='pb-2 font-heading text-[2rem] font-semibold leading-[3.5rem] text-primary lg:text-5xl lg:font-bold'>
        Reset password
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='pt-9 lg:pt-[3.375rem]' noValidate>
        {/* New password */}
        <div className='pt-4 lg:pt-6'>
          <Field
            label='New password'
            required
            validationState={errors.new_password_1 ? 'error' : 'none'}
            validationMessage={
              errors.new_password_1?.message && (
                <div className='pt-2 font-sans text-xs text-red-1'>
                  {errors.new_password_1?.message}
                </div>
              )
            }
            validationMessageIcon={null}
            className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
          >
            <Input
              {...register('new_password_1')}
              placeholder='Enter your new password'
              type={showPassword ? 'text' : 'password'}
              size='large'
              className='!text-sm'
              maxLength={128}
              contentAfter={
                showPassword ? (
                  <EyeOffRegular
                    aria-label='Show password'
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <EyeRegular
                    aria-label='Hide password'
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )
              }
              autoComplete='off'
            />
          </Field>
        </div>
        {/* Confirm new password */}
        <div className='pt-4 lg:pt-6'>
          <Field
            label='Confirm new password'
            required
            validationState={errors.new_password_2 ? 'error' : 'none'}
            validationMessage={
              errors.new_password_2?.message && (
                <div className='pt-2 font-sans text-xs text-red-1'>
                  {errors.new_password_2?.message}
                </div>
              )
            }
            validationMessageIcon={null}
            className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
          >
            <Input
              {...register('new_password_2')}
              placeholder='Confirm your new password'
              type={showCfPassword ? 'text' : 'password'}
              size='large'
              className='!text-sm'
              maxLength={128}
              contentAfter={
                showCfPassword ? (
                  <EyeOffRegular
                    aria-label='Show password'
                    onClick={() => setShowCfPassword(!showCfPassword)}
                  />
                ) : (
                  <EyeRegular
                    aria-label='Hide password'
                    onClick={() => setShowCfPassword(!showCfPassword)}
                  />
                )
              }
              autoComplete='off'
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
      {toasterComponent}
    </>
  );
};

export default ResetPwd;

ResetPwd.displayName = 'ResetPwd';
