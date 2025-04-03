'use client';
import useToastComponent from '@/app/hooks/Toast';
import { ChangePwdForm } from '@/app/types/auth';
import { Button, Field, Input, Spinner } from '@fluentui/react-components';
import { EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

interface IProps {
  handleChangeStatusChangePassword: (status: boolean) => void;
}

const ChangePassword = (props: IProps) => {
  const { handleChangeStatusChangePassword } = props;
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCfPwd, setShowCfPwd] = useState(false);
  // const { showSpinner, hideSpinner } = useSpinner();
  const [loading, setLoading] = useState(false);

  const pwdRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;
  const [successMsg, setSuccessMsg] = useState<JSX.Element | string>('');
  const { toasterComponent, showToast, setIntent, setTimeoutToast } = useToastComponent({
    content: successMsg,
  });

  const schema = yup.object({
    old_password: yup.string().required('The Old password is required.'),
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
    reset,
    resetField,
    formState: { errors },
  } = useForm<ChangePwdForm>({
    resolver: yupResolver(schema),
  });

  const handleClearForm = () => {
    setTimeout(() => {
      reset();
      reset({
        new_password_1: '',
        new_password_2: '',
        old_password: '',
      });
      resetField('new_password_1');
      resetField('new_password_2');
      resetField('old_password');
    }, 500);
  };

  const onSubmit = async (data: ChangePwdForm) => {
    try {
      setLoading(true);
      const response = await fetch('/api/plg/accounts/change-password/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const res = await response.json();
      if (response.ok) {
        handleChangeStatusChangePassword(false);
        handleClearForm();
        setSuccessMsg(res.detail);
        setIntent('success');
        showToast();
      } else {
        setIntent('error');
        setSuccessMsg(res.errors[0]);
        setTimeoutToast(4000);
        showToast();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='my-6 font-heading text-xl font-semibold text-primary'>Password</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Old password */}
        <div>
          <Field
            label='Old password'
            validationState={errors.old_password ? 'error' : 'none'}
            validationMessage={
              errors.old_password?.message && (
                <div className='absolute bottom-0 top-16 pt-2 font-sans text-xs text-red-1'>
                  {errors.old_password?.message}
                </div>
              )
            }
            validationMessageIcon={null}
            className='relative [&_label]:!font-semibold [&_label]:text-neutrual-900'
          >
            <Input
              {...register('old_password')}
              placeholder='Enter your old password'
              type={showOldPwd ? 'text' : 'password'}
              size='large'
              className='mt-1 !text-sm'
              maxLength={128}
              contentAfter={
                showOldPwd ? (
                  <EyeOffRegular
                    aria-label='Show old password'
                    onClick={() => setShowOldPwd(!showOldPwd)}
                  />
                ) : (
                  <EyeRegular
                    aria-label='Hide old password'
                    onClick={() => setShowOldPwd(!showOldPwd)}
                  />
                )
              }
              autoComplete='off'
            />
          </Field>
        </div>
        {/* New password */}
        <div className='pt-4 lg:pt-6'>
          <Field
            label='New password'
            validationState={errors.new_password_1 ? 'error' : 'none'}
            validationMessage={
              errors.new_password_1?.message && (
                <div className='absolute bottom-0 top-16 pt-2 font-sans text-xs text-red-1'>
                  {errors.new_password_1?.message}
                </div>
              )
            }
            validationMessageIcon={null}
            className='relative [&_label]:!font-semibold [&_label]:text-neutrual-900'
          >
            <Input
              {...register('new_password_1')}
              placeholder='Enter your new password'
              type={showPwd ? 'text' : 'password'}
              size='large'
              className='mt-1 !text-sm'
              maxLength={128}
              contentAfter={
                showPwd ? (
                  <EyeOffRegular aria-label='Show password' onClick={() => setShowPwd(!showPwd)} />
                ) : (
                  <EyeRegular aria-label='Hide password' onClick={() => setShowPwd(!showPwd)} />
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
            validationState={errors.new_password_2 ? 'error' : 'none'}
            validationMessage={
              errors.new_password_2?.message && (
                <div className='absolute bottom-0 top-16 pt-2 font-sans text-xs text-red-1'>
                  {errors.new_password_2?.message}
                </div>
              )
            }
            validationMessageIcon={null}
            className='relative [&_label]:!font-semibold [&_label]:text-neutrual-900'
          >
            <Input
              {...register('new_password_2')}
              placeholder='Confirm your new password'
              type={showCfPwd ? 'text' : 'password'}
              size='large'
              className='mt-1 !text-sm'
              maxLength={128}
              contentAfter={
                showCfPwd ? (
                  <EyeOffRegular
                    aria-label='Show password'
                    onClick={() => setShowCfPwd(!showCfPwd)}
                  />
                ) : (
                  <EyeRegular aria-label='Hide password' onClick={() => setShowCfPwd(!showCfPwd)} />
                )
              }
              autoComplete='off'
            />
          </Field>
        </div>

        {/* Action */}
        <div className='mt-6 flex w-full items-center justify-end gap-3'>
          <Button
            appearance='outline'
            size='large'
            onClick={() => {
              handleChangeStatusChangePassword(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            className='flex w-full gap-2 md:w-auto'
            appearance='primary'
            size='large'
          >
            {loading && <Spinner size='tiny' />}
            Update
          </Button>
        </div>
      </form>
      {toasterComponent}
    </>
  );
};
export default ChangePassword;
