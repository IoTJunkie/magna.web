'use client';
import useToastComponent from '@/app/hooks/Toast';
import { ISubscriptionPlan } from '@/app/types/billingAndSub';
import {
  IExchangeRate,
  IExchangeResources,
  IResource,
  IResourceLimit,
  ResourceType,
} from '@/app/types/creditInsight';
import { UserProfile } from '@/app/types/userProfile';
import { ACCOUNT_RESOURCE, USER_PROFILE } from '@/config';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Spinner, ToastIntent } from '@fluentui/react-components';
import axios from 'axios';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import ExchangeResources from './components/ExchangeResources';

const CreditInsight = () => {
  const [exchangeRate, setExchangeRate] = useState<IExchangeRate[] | null>(null);
  const [resource, setResource] = useState<IResource | any>(null);
  const [exchangeResource, setExchangeResource] = useState<IExchangeResources[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any | null>(null);
  const [msgPayment, setMsgPayment] = useState('');
  const [isBlockSpinner, setIsBlockSpinner] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const { data: userProfile } = useQuery<UserProfile>([USER_PROFILE]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useThemeContext();

  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: msgPayment,
  });

  const handleToastMsg = (intent: ToastIntent, msg: string) => {
    setIntent(intent);
    setMsgPayment(msg);
    showToast();
  };

  const calculatePer = (left: number, total: number) => {
    if (!left && !total) {
      return 0;
    }
    if (left > total) {
      return 100;
    }
    return Number(((left / total) * 100).toFixed(0));
  };

  const getResourceQuantity = (type: ResourceType) => {
    const rs = exchangeRate?.find((item) => item.resource_type === type);
    return Number(rs?.resource_quantity);
  };

  const getResourceCredit = (type: ResourceType) => {
    const rs = exchangeRate?.find((item) => item.resource_type === type);
    return Number(rs?.credits);
  };

  const getResource = async () => {
    const response = await axios.get('/api/plg/accounts/resource/');
    if (response?.data) {
      setResource(response.data);
    }
    return;
  };

  const { isFetching, isFetched } = useQuery([ACCOUNT_RESOURCE], getResource, {
    refetchOnWindowFocus: false,
  });

  const groupPlans = (subscription_plan: ISubscriptionPlan) => {
    if (subscription_plan?.is_consular) {
      return [{ key: null, list: subscription_plan?.descriptions }];
    } else {
      const subscriptionPlan = userProfile?.current_subscription?.subscription_plan;
      console.log('groupPlans', subscriptionPlan);
      const group1 = [
        `Storage Limit: ${
          typeof subscriptionPlan?.storage_limit === 'number'
            ? subscriptionPlan?.storage_limit >= 1000 * 1000 * 1000
              ? `${subscriptionPlan?.storage_limit / (1000 * 1000 * 1000)} GB`
              : `${subscriptionPlan?.storage_limit / (1000 * 1000)} MB`
            : 'Unlimited'
        }`,
        `Document Size Limit: ${
          typeof subscriptionPlan?.document_size_limit === 'number'
            ? subscriptionPlan?.document_size_limit >= 1000 * 1000 * 1000
              ? `${subscriptionPlan?.document_size_limit / (1000 * 1000 * 1000)} GB`
              : `${subscriptionPlan?.document_size_limit / (1000 * 1000)} MB`
            : 'Unlimited'
        }`,
      ];
      const group2 = [
        subscriptionPlan?.chat_with_files ? 'Chat with Files' : null,
        subscriptionPlan?.chat_with_folders
          ? 'Chat with Folders (Multiple Files and Folders)'
          : null,
      ].filter((item) => item);
      const group3 = [
        subscriptionPlan?.invite_team ? 'Invite teams' : null,
        subscriptionPlan?.policy_analyzer_report_card ? 'Policy Pro and Report Card' : null,
        subscriptionPlan?.discovery_tool_interrogatories ? 'Discovery Pro & Interrogatories' : null,
      ].filter((item) => item);
      const group4 = [
        subscriptionPlan?.customer_support_email ? 'Email' : null,
        subscriptionPlan?.customer_support_phone ? 'Phone' : null,
        subscriptionPlan?.support_turnaround
          ? `Support Turnaround: ${subscriptionPlan.support_turnaround} hours`
          : null,
        subscriptionPlan?.trial_period ? `Free Trial: ${subscriptionPlan.trial_period} days` : null,
      ].filter((item) => item);
      console.log('group3', group3);
      return [
        { key: 'Core Function', list: group1 },
        { key: 'User Preference', list: group2 },
        { key: 'Support Function', list: group3 },
        { key: 'Customer Support', list: group4 },
      ];
    }
  };

  // zeros

  const getSubscriptionPlans = async () => {
    try {
      setShowSpinner(true);
      const url = '/api/plg/productization/subscription-plans/';
      const response = await axios.get(url);
      if (response.status === 200) {
        setCurrentPlan(response.data.results[0]);
      }
    } catch (error) {
      console.log('error :>> ', error);
    } finally {
      setShowSpinner(false);
    }
  };

  const blockShowSpinner = () => {
    setIsBlockSpinner(true);
  };

  useEffect(() => {
    if (!isFetching) {
      const paymentSuccess = searchParams.get('success');
      if (paymentSuccess === 'true') {
        handleToastMsg(
          'success',
          "Payment successful! You'll receive a confirmation email shortly",
        );
        router.push('/settings/credit-insight/');
      }
      if (paymentSuccess === 'false') {
        handleToastMsg(
          'error',
          'Payment unsuccessful. Please review your payment information and try again.',
        );
        router.push('/settings/credit-insight/');
      }
    }
  }, [isFetching]);

  const currentSubResourceLimit = (profile: UserProfile | undefined): IResourceLimit | any => {
    if (profile !== undefined) {
      const resourceLimit: IResourceLimit = {
        storage_limit: profile.current_subscription?.subscription_plan?.storage_limit,
      };
      return resourceLimit;
    } else {
      return 100;
    }
  };

  useEffect(() => {
    if (typeof userProfile === 'object') {
      if (userProfile?.current_subscription) {
        setCurrentPlan(userProfile?.current_subscription?.subscription_plan);
      } else {
        getSubscriptionPlans();
      }
    }
  }, [userProfile]);

  useEffect(() => {
    const getExchangeRate = async () => {
      const response = await axios.get('/api/plg/productization/credit-exchange-rates/');
      if (response?.data?.results) {
        setExchangeRate(response.data.results);
      }
    };

    getExchangeRate();
  }, []);

  useEffect(() => {
    if (resource && !showSpinner) {
      const data: IExchangeResources[] = [
        {
          id: 'ex-storg',
          resource_type: ResourceType.STORAGE,
          resource_quantity: getResourceQuantity(ResourceType.STORAGE),
          resource_credit: getResourceCredit(ResourceType.STORAGE),
          resource_spent: resource.storage_spent,
          resource_limit: resource.storage_limit,
          name: 'Storage',
          percentage: calculatePer(
            resource.storage_limit - resource.storage_spent,
            currentSubResourceLimit(userProfile).storage_limit,
          ),
          is_unlimited_resource: false,
        },
      ];
      setExchangeResource(data);
    }
  }, [resource, exchangeRate, showSpinner]);

  if ((isFetching && !isBlockSpinner) || showSpinner) {
    return (
      <div className='size-full items-center justify-center'>
        <Spinner />
      </div>
    );
  }

  return (
    <div className='w-full p-10'>
      <div className='flex flex-col flex-wrap items-center justify-between gap-10 lg:flex-row lg:gap-1'>
        <div className='flex w-full max-w-[37.5rem] flex-wrap justify-between pb-3 lg:flex-nowrap'>
          <div className='whitespace-nowrap text-2xl font-medium '>
            Current plan:{' '}
            <span className='text-aero-8'>{currentPlan !== null ? currentPlan.name : 'Free'}</span>
          </div>
        </div>
      </div>
      <div className='mt-10 grid grid-cols-1 flex-wrap justify-center gap-x-[3.75rem] gap-y-6 lg:grid-cols-[40%_55%] lg:flex-nowrap'>
        {exchangeResource.map((item) => (
          <ExchangeResources
            key={item.id}
            exchangeResource={item}
            resource={resource ? resource : undefined}
            isFetched={isFetched}
            blockSpinner={blockShowSpinner}
            theme={theme}
          />
        ))}
        {/* Credit (total & speed) */}
        {/* <div
          className={`flex w-auto flex-col items-center justify-center gap-4 rounded-xl border-[1px] border-solid border-color-msg-user-stroke p-10 md:flex-row md:justify-between lg:col-start-1 lg:row-start-1 ${styles.flex}`}
        >
          <div
            className={`flex w-auto flex-col items-center justify-center text-center md:items-start md:text-start ${styles.flex}`}
          >
            <p className='text-3xl font-[600] text-color-menu-active'>Credits</p>
            <p className='text-2xl font-[500] text-neutrual-400'>
              Total credits:{' '}
              {`${resource?.credit_spent !== undefined ? resource?.credits - resource?.credit_spent : 0}`}
            </p>
          </div>
          <div
            className={`!h-[196px] !w-[196px] rounded-full bg-bg-graph py-3 ${theme === ThemeTypes.DARK ? styles.shadow_dark : styles.shadow_light}`}
          >
            <Speedometter
              credits={resource && resource.credits - resource.credit_spent}
              theme={theme}
            />
          </div>
        </div> */}
        <div className='row-span-2 flex w-auto flex-col gap-3 rounded-xl border-[1px] border-color-msg-user-stroke p-6 lg:col-start-2 lg:row-start-1'>
          <div className='mb-2 h-11 border-b-2 border-solid border-color-menu-active text-2xl font-[500] text-color-text-support'>
            Plan Features
          </div>
          <div className='flex flex-col gap-3'>
            {groupPlans(currentPlan).map((item, index) => {
              return (
                <div key={index} className='flex flex-col gap-3 rounded-[8px] px-2 py-3'>
                  {item.key && (
                    <p className='text-sm font-bold text-color-text-default'>{item?.key}</p>
                  )}
                  {item.list.map((item) => (
                    <div key={item} className='flex items-center gap-2 pl-4'>
                      <Image
                        src='/svg/success-circle.svg'
                        alt=''
                        width={20}
                        height={20}
                        className='pt-[0.125rem]'
                      />
                      <div className='text-sm font-normal'>{item}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {toasterComponent}
    </div>
  );
};

export default CreditInsight;
