'use client';

import TermAndPolicyDialog from '@/app/_components/term-policy-dialog';
import useToastComponent from '@/app/hooks/Toast';
import { RegisterForm } from '@/app/types/auth';
import { useSpinner } from '@/contexts/SpinnerContext';
import { Button, Checkbox, Field, Input } from '@fluentui/react-components';
import { EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import DialogError from '../common/DialogError';

const Register = () => {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [isHavingVoucher, setIsHavingVoucher] = useState(true);
  const [showCfPassword, setShowCfPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<JSX.Element | string>('');
  const pwdRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;

  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: successMsg,
  });
  const { showSpinner, hideSpinner } = useSpinner();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOpenTermAndPolicy, setIsOpenTermAndPolicy] = useState(false);

  const [errMsg, setErrMsg] = useState<string | null>(null);

  const refFormData = useRef<RegisterForm | null>(null);

  const schema = yup
    .object({
      first_name: yup.string(),
      last_name: yup.string(),
      email: yup
        .string()
        .trim()
        .required('The Email address is required.')
        .email('Invalid email format. Please enter a valid email address.'),
      password: yup
        .string()
        .required('The Password is required.')
        .matches(
          pwdRegex,
          'Password must be at least 8 characters and contains lowercases, uppercases, numbers and special characters',
        ),
      confirm_password: yup
        .string()
        .required('The Confirm Password is required.')
        .test(
          'passwords-match',
          'Passwords do not match. Please ensure that the password and confirm password fields match.',
          function (value, context) {
            return !!value && context.parent.password === value;
          },
        ),
      agree_policy: yup.boolean().oneOf([true], 'Please agree to the Legal Disclaimer to proceed.'),
    })
    .required();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
  });

  const handleRegister = async () => {
    try {
      if (refFormData.current) {
        if (!refFormData.current?.register_token) {
          const newData = { ...refFormData.current };
          delete newData.register_token;
          refFormData.current = newData;
        }
        showSpinner();
        const params: RegisterForm = {
          ...refFormData.current,
          base_url: process.env.NEXT_PUBLIC_WEB_DOMAIN,
        };

        if (token) {
          params.invite_token = token;
        }
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(params),
        });
        const res = await response.json();
        if (res?.non_field_errors && res?.non_field_errors.length > 0) {
          const msg = res?.non_field_errors[0];
          setErrMsg(msg);
        }

        if (res.message) {
          setIsSubmitted(true);
          setSuccessMsg(res.message);
          setIntent('success');
          showToast();
        } else {
          for (const key in res) {
            setError(key as any, {
              type: 'sever',
              message: res[key].join(),
            });
          }
        }
      }
    } catch (error) {
    } finally {
      hideSpinner();
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    refFormData.current = data;
    handleRegister();
  };

  useEffect(() => {
    if (token) {
      setIsHavingVoucher(false);
    }
  }, [token]);

  return (
    <>
      {isSubmitted ? (
        <>
          <div className='pb-2 font-heading text-[2rem] font-semibold leading-[3.5rem] text-primary lg:text-5xl lg:font-bold'>
            Check your email!
          </div>
          <div className='text-base leading-6 text-support'>
            Verification link has been sent to your email.
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
            {isHavingVoucher ? 'Register' : "You're joining a team plan!"}
          </div>
          <div className='text-base leading-6 text-support'>
            {isHavingVoucher
              ? 'Let us know your detail information.'
              : 'An user has invited you to register'}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className='pt-9 lg:pt-[3.375rem]' noValidate>
            <div className='flex flex-col lg:flex-row lg:items-center lg:gap-4'>
              {/* First name */}
              <div className='basis-0 lg:basis-1/2'>
                <Field
                  label='First name'
                  validationState={errors.first_name ? 'error' : 'none'}
                  validationMessage={
                    errors.first_name?.message && (
                      <div className='pt-2 font-sans text-xs text-red-1'>
                        {errors.first_name?.message}
                      </div>
                    )
                  }
                  validationMessageIcon={null}
                  className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
                >
                  <Input
                    {...register('first_name')}
                    placeholder='Enter your First name'
                    size='large'
                    className='!text-sm'
                    maxLength={150}
                  />
                </Field>
              </div>

              {/* Last name */}
              <div className='basis-0 pt-4 lg:basis-1/2 lg:pt-0'>
                <Field
                  label='Last name'
                  validationState={errors.last_name ? 'error' : 'none'}
                  validationMessage={
                    errors.last_name?.message && (
                      <div className='pt-2 font-sans text-xs text-red-1'>
                        {errors.last_name?.message}
                      </div>
                    )
                  }
                  validationMessageIcon={null}
                  className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
                >
                  <Input
                    {...register('last_name')}
                    placeholder='Enter your Last name'
                    size='large'
                    className='!text-sm'
                    maxLength={150}
                  />
                </Field>
              </div>
            </div>

            {/* Email address */}
            <div className='pt-4 lg:pt-6'>
              <Field
                label='Email address'
                required
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
                  autoComplete='off'
                />
              </Field>
            </div>

            {/* Password */}
            <div className='pt-4 lg:pt-6'>
              <Field
                label='Password'
                required
                validationState={errors.password ? 'error' : 'none'}
                validationMessage={
                  errors.password?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>
                      {errors.password?.message}
                    </div>
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
                  autoComplete='off'
                />
              </Field>
            </div>

            {/* Confirm Password */}
            <div className='pt-4 lg:pt-6'>
              <Field
                label='Confirm Password'
                required
                validationState={errors.confirm_password ? 'error' : 'none'}
                validationMessage={
                  errors.confirm_password?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>
                      {errors.confirm_password?.message}
                    </div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('confirm_password')}
                  placeholder='Re-enter your Password'
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
                        aria-label='Show password'
                        onClick={() => setShowCfPassword(!showCfPassword)}
                      />
                    )
                  }
                />
              </Field>
            </div>
            <div className='mt-8 flex items-center'>
              <Field
                label=''
                validationState={errors.agree_policy ? 'error' : 'none'}
                validationMessage={
                  errors.agree_policy?.message && (
                    <div className='font-sans text-xs text-red-1'>
                      {errors.agree_policy?.message}
                    </div>
                  )
                }
                validationMessageIcon={null}
                className='!block [&_label]:text-neutrual-900'
              >
                <Checkbox
                  {...register('agree_policy')}
                  label={<p>I agree with </p>}
                  className='ml-[-0.5rem]'
                />
                <span
                  role='button'
                  onClick={() => setIsOpenTermAndPolicy(true)}
                  className='font-semibold leading-9 text-aero-7 hover:underline'
                >
                  Legal Disclaimer
                </span>
              </Field>
            </div>

            {/* Action */}
            <div className='pt-[2.75rem] lg:pt-8'>
              <Button type='submit' className='w-full' appearance='primary' size='large'>
                Confirm
              </Button>
            </div>
          </form>
        </>
      )}
      {toasterComponent}
      <TermAndPolicyDialog
        open={isOpenTermAndPolicy}
        onClose={() => setIsOpenTermAndPolicy(false)}
      />
      {errMsg && (
        <DialogError
          open={true}
          setOpen={() => {}}
          onClose={() => {
            setErrMsg(null);
          }}
          title={'Verification Error'}
          content={errMsg}
        />
      )}
    </>
  );
};

export default Register;

Register.displayName = 'Register';
