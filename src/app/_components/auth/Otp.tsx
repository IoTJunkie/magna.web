'use client';
import { OtpForm } from '@/app/types/auth';
import { Button, Field, Input, Spinner } from '@fluentui/react-components';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import CustomIcon from '../common/CustomIcon';
import DialogError from '../common/DialogError';

const Otp = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [getAccessTokenSuccess, setGetAccessTokenSuccess] = useState(false);
  const schema = yup
    .object({
      email: yup
        .string()
        .trim()
        .required('The Email address is required.')
        .email('Invalid email format. Please enter a valid email address.'),
      code: yup.string().required('The OTP is required.'),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ email, code }: OtpForm) => {
    try {
      setLoading(true);
      const params = {
        email: email,
        code: code,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/pro-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        setLoading(false);
        const error = await res.json();
        if (error?.code && error?.code.length > 0) {
          setErrMsg(error?.code[0]);
        } else if (error?.email && error?.email.length > 0) {
          setErrMsg(error?.email[0]);
        }
      } else {
        setGetAccessTokenSuccess(true);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/signin');
    setGetAccessTokenSuccess(false);
  };

  return (
    <>
      {getAccessTokenSuccess ? (
        <div className='flex flex-col items-center'>
          <div className='mb-2 text-3xl font-bold text-primary'>Access code sent</div>
          <CustomIcon name='icon-success' width={88} height={88} />
          <div className='mb-4 mt-6 max-w-96 text-center text-base font-bold text-primary'>
            Email with access code sent successfully <br /> Please check your email.
          </div>
          <Button
            className='w-full sm:w-96'
            size='large'
            appearance='primary'
            onClick={handleBackToLogin}
          >
            Confirm
          </Button>
        </div>
      ) : (
        <div className='flex w-full flex-col justify-center '>
          <div className='pb-2 font-heading text-[2rem] font-semibold leading-[3.5rem] text-primary lg:text-5xl lg:font-bold'>
            Email Verification
          </div>
          <div className='mt-2 text-base text-text-support'>
            Enter your email for an access validation
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className='pt-9 lg:pt-[3.375rem]'>
            <div className='relative'>
              <Field
                label='Email address'
                validationState={errors.email ? 'error' : 'none'}
                validationMessage={
                  errors.email?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1 lg:absolute'>
                      {errors.email?.message}
                    </div>
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
            <div className='relative pt-4 lg:pt-6'>
              <Field
                label='OTP'
                validationState={errors.code ? 'error' : 'none'}
                validationMessage={
                  errors.code?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1 lg:absolute'>
                      {errors.code?.message}
                    </div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('code')}
                  placeholder='Enter your OTP'
                  size='large'
                  className='!text-sm'
                  maxLength={254}
                />
              </Field>
            </div>
            <div className='pt-[2.75rem] lg:pt-16'>
              <Button
                type='button'
                className='flex w-full items-center gap-2'
                onClick={handleSubmit(onSubmit)}
                appearance='primary'
                size='large'
              >
                {loading && <Spinner size='tiny' />}
                Get Access Code
              </Button>
              <div className='py-3 text-center text-base text-neutrual-700 lg:py-5'>or</div>
              <Button className='w-full' size='large' onClick={() => router.push('/register')}>
                Sign up
              </Button>
            </div>
          </form>
        </div>
      )}

      {errMsg ? (
        <DialogError
          open={true}
          setOpen={() => {}}
          onClose={() => {
            setErrMsg(null);
          }}
          title={'Verification Error'}
          content={errMsg}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default Otp;
