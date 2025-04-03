'use client';

import ConfirmDialog from '@/app/_components/common/ConfirmDialog';
import CustomIcon from '@/app/_components/common/CustomIcon';
import { useProfileStore } from '@/app/_components/profile/profile-store';
import useToastComponent from '@/app/hooks/Toast';
import { UpdateProfileForm } from '@/app/types/auth';
import { ICurrentSubscription } from '@/app/types/billingAndSub';
import { UserProfile } from '@/app/types/userProfile';
import { countries } from '@/app/utils';
import { PlansName, USER_PROFILE } from '@/config';
import { useSpinner } from '@/contexts/SpinnerContext';
import {
  Button,
  Field,
  Image as ImageFluent,
  Input,
  Select,
  Spinner,
  Switch,
  ToastIntent,
  Tooltip,
} from '@fluentui/react-components';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import classNames from 'classnames';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { isEmpty } from 'lodash';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import * as yup from 'yup';
import Dropdown from './components/Dropdown';
import ChangePassword from './components/ChangePassword';
import CloseAccount from '../CloseAccount';

const ProfileManagement = () => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [successMsg, setSuccessMsg] = useState<JSX.Element | string>('');
  const [initValues, setInitValues] = useState<UpdateProfileForm>({});
  const [showDropdown, setShowDropdown] = useState<boolean>(true);
  const [showDropdownRef, setShowDropdownRef] = useState<boolean>(true);
  const [currentSubscription, setCurrentSubscription] = useState<ICurrentSubscription | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { profileInfo, setProfileInfo } = useProfileStore();
  const [sttOrcSupport, setSttOrcSupport] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | ''>('');
  const [showDialogConfirmOcr, setShowDialogConfirmOcr] = useState(false);
  // const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  // const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [statusEditProfile, setStatusEditProfile] = useState<boolean>(true);
  const [statusChangePassword, setStatusChangePassword] = useState<boolean>(false);
  const [showDeactiveAccount, setShowDeactiveAccount] = useState<boolean>(false);

  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: successMsg,
  });
  const queryClient = useQueryClient();
  const validTypeAvatar = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxFileSizeMB = 5;

  const schema = yup.object({});

  const getUserProfile = () => {
    fetch('/api/plg/accounts/profile/')
      .then((response: { json: () => any }) => response.json())
      .then((data) => {
        data.dial_code = '';
        if (data.mobile) {
          const mobile = data.mobile.split(' ');
          data.dial_code = mobile[0];
          data.mobile = mobile[1];
        }
        setSttOrcSupport(data?.active_ocr_support);
        setCurrentSubscription(data.current_subscription);
        const { avatar_url, current_subscription, languages, ...initData } = data;
        setInitValues(initData);
        setSelectedImage(avatar_url);
      });
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<UpdateProfileForm>({
    resolver: yupResolver(schema),
    shouldUnregister: false,
  });

  // useEffect(() => {
  //   reset(initValues);
  // }, [initValues, reset, theme]);

  const handleToastMsg = (intent: ToastIntent, msg: string) => {
    setIntent(intent);
    setSuccessMsg(msg);
    showToast();
  };

  const handleChangeStatusEditProfile = (stt: boolean) => {
    setStatusEditProfile(stt);
  };

  const handleChangeStatusChangePassword = (stt: boolean) => {
    setStatusChangePassword(stt);
  };

  const onSubmit = async (data: UpdateProfileForm) => {
    try {
      // transform data
      const params = { ...data };
      params.mobile = data.dial_code && data.mobile ? `${data.dial_code} ${data.mobile}` : null;

      showSpinner();
      const response = await fetch('/api/plg/accounts/profile/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (typeof selectedImage === 'string' && selectedImage.length === 0) {
        const session = await getSession();
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/profile/`,
          {
            avatar_url: null,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.user?.access_token}`,
            },
          },
        );
        const prevProfileInfo = { ...profileInfo };
        setProfileInfo({
          ...prevProfileInfo,
          avatar_url: res.data.avatar,
        } as UserProfile);
      } else if (selectedImage !== null && typeof selectedImage === 'object') {
        const formData = new FormData();
        formData.append('files', selectedImage ?? '');
        const session = await getSession();
        const resAvatar: any = await axios.post(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/profile/upload-avatar/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${session?.user?.access_token}`,
            },
          },
        );

        const prevProfileInfo = { ...profileInfo };
        setProfileInfo({
          ...prevProfileInfo,
          avatar_url: resAvatar.data.avatar ?? null,
        } as UserProfile);
      }
      const res = await response.json();
      if (response.ok) {
        setSuccessMsg('Update Profile Successfully');
        handleChangeStatusEditProfile(true);
        showToast();
        setIntent('success');
        queryClient.invalidateQueries([USER_PROFILE]);
      } else {
        for (const key in res) {
          setError(key as any, {
            type: 'sever',
            message: res[key].join(),
          });
        }
      }
    } catch (error) {
    } finally {
      setInitValues(data);
      hideSpinner();
    }
  };

  const cancelSubscription = async () => {
    try {
      showSpinner();
      const session = await getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/productization/subscriptions/delete/${currentSubscription?.subscription_id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        },
      );
      const res = await response.json();
      if (response.ok) {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    } finally {
      getUserProfile();
      hideSpinner();
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    // showSpinner();
    try {
      console.log('file?.size---->', file?.size);

      const fileSizeMB = (file?.size ?? 0) / (1024 * 1024);
      console.log('fileSizeMB---->', fileSizeMB);
      if (file && validTypeAvatar.includes(file.type) && fileSizeMB < maxFileSizeMB) {
        setSelectedImage(file);
      } else {
        handleToastMsg(
          'error',
          `Invalid image file. Please upload .png, .jpg, .jpeg, .gif files under ${maxFileSizeMB} MB only`,
        );
      }
    } catch (error) {
      console.log('error--->', error);
    } finally {
      // hideSpinner();
    }
  };

  const handleSelectImage = () => {
    if (inputRef.current && !statusEditProfile) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const handleDeleteAvatar = async () => {
    if (statusEditProfile) return;
    setSelectedImage('');
    // showSpinner();
    // try {
    //   const session = await getSession();
    //   const res: any = await axios.put(
    //     `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/profile/`,
    //     {
    //       avatar_url: null,
    //     },
    //     {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${session?.user?.access_token}`,
    //       },
    //     },
    //   );
    //   setInitValues(res.data);
    //   setProfileInfo(res.data);
    // } catch (error) {
    //   console.log(error);
    // } finally {
    //   hideSpinner();
    // }
  };

  // const handleUploadImage = async () => {
  //   setShowDialog(false);
  //   showSpinner();
  //   try {
  //     const formData = new FormData();
  //     formData.append('files', selectedImage ?? '');
  //     const session = await getSession();
  //     const res: any = await axios.post(
  //       `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/profile/upload-avatar/`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //           Authorization: `Bearer ${session?.user?.access_token}`,
  //         },
  //       },
  //     );
  //     setInitValues((previouseValues) => ({
  //       ...previouseValues,
  //       avatar_url: res.data.avatar,
  //     }));
  //     hideSpinner();
  //   } catch (error) {
  //     console.log('error--->', error);
  //     hideSpinner();
  //   }
  // };

  const handleChangeOcrStt = async (stt: boolean) => {
    const params = { active_ocr_support: stt };
    const response = await fetch('/api/plg/accounts/profile/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const rs = await response.json();
    if (rs) {
      setSttOrcSupport(rs.active_ocr_support);
      setShowDialogConfirmOcr(false);
    }
  };

  const onChangeSttOrcSupport = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      handleChangeOcrStt(true);
    } else {
      setShowDialogConfirmOcr(true);
    }
  };

  const handleTurnOffOcr = async () => {
    handleChangeOcrStt(false);
  };

  if (isEmpty(initValues)) {
    return (
      <div className='mt-12 size-full items-center justify-center'>
        <Spinner />
      </div>
    );
  }
  return (
    <>
      <div className='font-heading text-[1.5rem] font-medium leading-[2.5rem] text-primary lg:text-[2rem] lg:font-semibold'>
        Profile Management
      </div>
      {!isEmpty(initValues) && (
        <form onSubmit={handleSubmit(onSubmit)} className='pt-[2rem] lg:pt-9' noValidate>
          {/* Email address */}
          <div className='mb-6 flex items-center justify-between font-semibold'>
            <div className='text-2xl text-[#0B0B0C]'>Personal Info</div>
            {statusEditProfile && (
              <div
                className='cursor-pointer text-base text-aero-7'
                onClick={() => {
                  handleChangeStatusEditProfile(false);
                }}
              >
                Edit
              </div>
            )}
          </div>
          <div className='flex flex-col pt-4 lg:flex-row lg:gap-4 lg:pt-6 '>
            <div>
              <div>
                {selectedImage ? (
                  <div
                    className={classNames(
                      'relative mr-2 mt-1 flex size-[10rem] flex-col items-center rounded-[0.25rem] border-[0.0625rem] border-solid border-color-screen-stroke hover:cursor-pointer',
                      {
                        '!cursor-not-allowed': statusEditProfile,
                      },
                    )}
                  >
                    <ImageFluent
                      src={
                        typeof selectedImage === 'string'
                          ? selectedImage
                          : URL.createObjectURL(selectedImage)
                      }
                      alt={'Profile image'}
                      width='100%'
                      height='100%'
                      fit='cover'
                    />
                    <div className='absolute left-0 top-0 size-full rounded-[0.25rem] bg-black/25 opacity-0 hover:opacity-100'>
                      <Image
                        className='absolute left-[5%] top-[75%] translate-x-[0%] translate-y-[0%]'
                        src={'/svg/edit-image.svg'}
                        alt='edit-icon'
                        width={28}
                        height={28}
                        onClick={handleSelectImage}
                      />
                      <Image
                        className='absolute left-[75%] top-[75%] translate-x-[0%] translate-y-[0%]'
                        src={'/svg/trash.svg'}
                        alt='delete-icon'
                        width={28}
                        height={28}
                        onClick={handleDeleteAvatar}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className='flex size-[10rem] flex-col items-center justify-center gap-2 rounded-lg border-[0.0625rem] border-solid border-color-screen-stroke
                  bg-bg-avatar px-3 hover:cursor-pointer'
                    onClick={handleSelectImage}
                  >
                    <CustomIcon name='add-more' />
                    <div className='text-center text-sm font-[500] text-color-text-default'>
                      Add profile picture
                    </div>
                    <div className='text-center text-xs text-[#93939B]'>
                      PNG, JPG, JPEG formats, up to 5 MB
                    </div>
                  </div>
                )}
                <input
                  id='image-input'
                  type='file'
                  ref={inputRef}
                  accept='image/*'
                  onInput={handleImageChange}
                  className='hidden'
                  disabled={statusEditProfile}
                />
              </div>
            </div>
            <div className='flex w-full flex-col'>
              <Field
                label='Email address'
                className='[&_*]:!text-color-text-default [&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('email')}
                  defaultValue={initValues?.email || ''}
                  disabled
                  size='large'
                  className='mt-1 !border-[#C7C7C7] !bg-input-disable [&_*]:!text-sm'
                  maxLength={128}
                  autoComplete='off'
                />
              </Field>
              <div className='flex flex-col pt-4 lg:flex-row lg:items-center lg:gap-4 lg:pt-6'>
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
                      defaultValue={initValues?.first_name || ''}
                      placeholder='Enter your First name'
                      size='large'
                      className='mt-1 !bg-color-screen-bg !text-sm'
                      maxLength={150}
                      disabled={statusEditProfile}
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
                      defaultValue={initValues?.last_name || ''}
                      placeholder='Enter your Last name'
                      size='large'
                      className='mt-1 !bg-color-screen-bg !text-sm'
                      maxLength={150}
                      disabled={statusEditProfile}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>

          {/* Address line 1 */}
          <div className='pt-4 lg:pt-6'>
            <Field
              label='Address line 1'
              className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
            >
              <Input
                {...register('address_line_1')}
                defaultValue={initValues?.address_line_1 || ''}
                size='large'
                placeholder='Enter your address line 1'
                className='mt-1 !bg-color-screen-bg !text-sm'
                maxLength={256}
                autoComplete='off'
                disabled={statusEditProfile}
              />
            </Field>
          </div>

          {/* Address line 2 */}
          <div className='pt-4 lg:pt-6'>
            <Field
              label='Address line 2'
              className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
            >
              <Input
                {...register('address_line_2')}
                defaultValue={initValues?.address_line_2 || ''}
                placeholder='Enter your address line 2'
                size='large'
                className='mt-1 !bg-color-screen-bg !text-sm'
                maxLength={256}
                autoComplete='off'
                disabled={statusEditProfile}
              />
            </Field>
          </div>

          <div className='flex flex-col pt-4 lg:flex-row lg:items-baseline lg:gap-4 lg:pt-6'>
            {/* Country */}
            <div className='basis-0 lg:basis-1/2'>
              <div className='my-[0.125rem] pb-1 text-sm font-semibold text-neutrual-900'>
                Country
              </div>
              <Select
                size='large'
                {...register('country')}
                className={classNames(
                  'mt-1 [&_select]:!w-full [&_select]:!bg-color-screen-bg [&_select]:!text-sm',
                )}
                key='country'
                defaultValue={initValues?.country || ''}
                disabled={statusEditProfile}
              >
                <option value='' disabled selected>
                  Select Country
                </option>
                {countries.map((option) => (
                  <option key={option.code} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* City */}
            <div className='basis-0 pt-4 lg:basis-1/2 lg:pt-0'>
              <Field
                label='City'
                validationState={errors.city ? 'error' : 'none'}
                validationMessage={
                  errors.city?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>{errors.city?.message}</div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('city')}
                  defaultValue={initValues?.city || ''}
                  placeholder='Enter city'
                  size='large'
                  className='mt-1 !bg-color-screen-bg !text-sm'
                  maxLength={256}
                  disabled={statusEditProfile}
                />
              </Field>
            </div>
          </div>

          <div className='flex flex-col pt-4 lg:flex-row lg:items-baseline lg:gap-4 lg:pt-6'>
            {/* State */}
            <div className='basis-0 lg:basis-1/2'>
              <Field
                label='State'
                validationState={errors.state ? 'error' : 'none'}
                validationMessage={
                  errors.state?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>{errors.state?.message}</div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('state')}
                  defaultValue={initValues?.state || ''}
                  placeholder='Enter state'
                  size='large'
                  className='mt-1 !bg-color-screen-bg !text-sm'
                  maxLength={256}
                  disabled={statusEditProfile}
                />
              </Field>
            </div>

            {/* Zip Code */}
            <div className='basis-0 pt-4 lg:basis-1/2 lg:pt-0'>
              <Field
                label='Zip code'
                validationState={errors.zip_code ? 'error' : 'none'}
                validationMessage={
                  errors.zip_code?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>
                      {errors.zip_code?.message}
                    </div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('zip_code')}
                  defaultValue={initValues?.zip_code || ''}
                  placeholder='Enter zip code'
                  size='large'
                  className='mt-1 !bg-color-screen-bg !text-sm'
                  maxLength={50}
                  type='number'
                  onKeyDown={(evt) =>
                    ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()
                  }
                  disabled={statusEditProfile}
                />
              </Field>
            </div>
          </div>

          <div className='my-[0.125rem] pb-1 pt-4 text-sm  font-semibold text-neutrual-900 lg:pt-6'>
            Mobile number
          </div>
          <div className='flex flex-col lg:flex-row lg:items-start lg:gap-4'>
            <div className='basis-0 lg:basis-1/2'>
              {/* Mobile Country Flag */}
              <Select
                size='large'
                {...register('dial_code')}
                className={classNames(
                  'mt-1 [&_select]:!w-full [&_select]:!bg-color-screen-bg [&_select]:!text-sm',
                )}
                defaultValue={initValues?.dial_code || ''}
                disabled={statusEditProfile}
              >
                <option value='' disabled selected>
                  Select Country Code
                </option>
                {countries.map((option) => (
                  <option key={option.code} value={option.dial_code}>
                    {`${getUnicodeFlagIcon(option.code)} (${option.dial_code}) ${option.name}`}
                  </option>
                ))}
              </Select>
            </div>

            {/* mobile */}
            <div className='basis-0 pt-6 lg:basis-1/2 lg:pt-0'>
              <Field
                validationState={errors.mobile ? 'error' : 'none'}
                validationMessage={
                  errors.mobile?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>
                      {errors.mobile?.message}
                    </div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:invisible [&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('mobile')}
                  defaultValue={initValues?.mobile || ''}
                  type='number'
                  placeholder='Enter mobile'
                  size='large'
                  className='visible mt-1 !bg-color-screen-bg !text-sm'
                  maxLength={50}
                  onKeyDown={(evt) =>
                    ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()
                  }
                  disabled={statusEditProfile}
                />
              </Field>
            </div>
          </div>

          {/* Telephone number */}
          <div className='pt-4 lg:pt-6'>
            <Field
              label='Telephone number'
              validationState={errors.phone ? 'error' : 'none'}
              validationMessage={
                errors.phone?.message && (
                  <div className='pt-2 font-sans text-xs text-red-1'>{errors.phone?.message}</div>
                )
              }
              validationMessageIcon={null}
              className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
            >
              <Input
                {...register('phone')}
                defaultValue={initValues?.phone || ''}
                placeholder='Enter telephone number'
                size='large'
                className='mt-1 !bg-color-screen-bg !text-sm'
                maxLength={50}
                type='number'
                onKeyDown={(evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
                disabled={statusEditProfile}
              />
            </Field>
          </div>
          <div className='h-10'>
            {!statusEditProfile && (
              <div className='my-9 flex w-full justify-end gap-3'>
                <Button
                  appearance='outline'
                  size='large'
                  onClick={() => {
                    handleChangeStatusEditProfile(true);
                  }}
                >
                  Cancel
                </Button>
                <Button type='submit' appearance='primary' size='large'>
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </form>
      )}
      {/* Login & Security */}
      {/* <div className='mt-9 flex w-full items-center justify-between font-semibold'>
        <div className='text-2xl'>Login & Security</div>
        {!statusChangePassword && (
          <div
            className='cursor-pointer text-base text-[#418C61]'
            onClick={() => {
              handleChangeStatusChangePassword(true);
            }}
          >
            Update
          </div>
        )}
      </div> */}
      {statusChangePassword && (
        <div>
          <ChangePassword handleChangeStatusChangePassword={handleChangeStatusChangePassword} />
        </div>
      )}
      <div
        className='mb-12 mt-3 flex cursor-pointer items-center gap-3 '
        onClick={() => {
          setShowDeactiveAccount(true);
        }}
      >
        <Image src='/svg/lock.svg' width={20} height={20} alt='' />
        <div className='h-fit pt-[0.125rem] font-medium text-[#F04438]'>Deactivate account</div>
      </div>

      {currentSubscription?.subscription_plan?.name === PlansName.Plus && (
        <div className='mb-9 w-full'>
          <div
            className='flex w-full cursor-pointer flex-row justify-between'
            onClick={() => setShowDropdownRef(!showDropdownRef)}
          >
            <p className='text-lg font-[600] text-color-text-default'>My Preferences</p>
            <Image
              src={showDropdownRef ? '/svg/chevron-down.svg' : '/svg/chevron-right.svg'}
              className='cursor-pointer'
              alt='icon'
              width={24}
              height={24}
            />
          </div>
          {showDropdownRef && (
            <div className='mt-2 flex items-center gap-8'>
              <div className='text-base font-medium text-text-support'>OCR</div>
              <Tooltip
                content={
                  <div>
                    OCR is always on for enhanced performance in scanning content from images and
                    PDFs.
                  </div>
                }
                relationship='label'
              >
                <Switch checked={sttOrcSupport} onChange={onChangeSttOrcSupport} />
              </Tooltip>
            </div>
          )}
        </div>
      )}

      {currentSubscription?.subscription_plan?.name && (
        <div className='w-full'>
          <div
            className='flex w-full cursor-pointer flex-row justify-between'
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <p className='text-lg font-[600] text-color-text-default'>My subscription</p>
            <Image
              src={showDropdown ? '/svg/chevron-down.svg' : '/svg/chevron-right.svg'}
              className='cursor-pointer'
              alt='icon'
              width={24}
              height={24}
            />
          </div>
          {showDropdown && (
            <Dropdown
              current_subscription={currentSubscription}
              onCancel={() => cancelSubscription()}
            />
          )}
        </div>
      )}
      {showDialogConfirmOcr && (
        <ConfirmDialog
          open={showDialogConfirmOcr}
          title='Turn off OCR'
          content='By turning off OCR support, you will no longer be able to upload image files. Are you sure you want to proceed?'
          textConfirm='Turn off'
          onCancel={() => {
            setShowDialogConfirmOcr(false);
          }}
          onConfirm={handleTurnOffOcr}
          btnColorBtnConfirm='danger'
        />
      )}
      {/* {showDialog && (
        <ChangeProfilePictureDialog
          open={showDialog}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          handleUploadImage={handleUploadImage}
          onCancel={() => setShowDialog(false)}
        />
      )} */}
      {showDeactiveAccount && (
        <CloseAccount open={showDeactiveAccount} close={setShowDeactiveAccount} />
      )}
      {toasterComponent}
    </>
  );
};
export default ProfileManagement;
