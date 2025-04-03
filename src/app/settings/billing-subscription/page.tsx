'use client';
import useToastComponent from '@/app/hooks/Toast';
import { ISubscriptionPlan, ISubscriptionPlanCustom, Plan } from '@/app/types/billingAndSub';
import {
  intMax,
  PlansName,
  SETTING_ACCOUNT_PROFILE,
  SETTING_SUBSCRIPTION_PLAN,
  StatustrialPeriodEnd,
  STORAGE_ITEM_NAME,
} from '@/config';
import { Spinner, ToastIntent } from '@fluentui/react-components';
import axios from 'axios';
import classNames from 'classnames';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import SubscriptionPlanNew from './components/SubscriptionPlanNew';
import ContactUsFormPopUp from './components/FormPopup';
import { displayStorage } from '../credit-insight/displayStorage';
import { useSearchParams } from 'next/navigation';
import { statusTrial } from '@/app/utils/checkTrialEnded';
import { useProfileStore } from '@/app/_components/profile/profile-store';

const getNormalPlan = (name: string, plan: ISubscriptionPlan) => {
  const additionalUsers = name === PlansName.Premium ? '$14.00' : '$40.00';
  return {
    id: plan.id,
    name: name,
    prices: plan.prices,
    description: [
      {
        name: 'Document Limits',
        childrent: [
          {
            bold: plan.document_limit !== intMax ? plan.document_limit : 'Unlimited',
            normal: 'documents',
          },
          {
            bold: plan.question_limit !== intMax ? plan.question_limit : 'Unlimited',
            normal: 'questions',
          },
        ],
      },
      {
        name: 'Included Users',
        childrent: [
          {
            bold: plan.maximum_member,
            normal:
              plan.maximum_member > 1
                ? `users (additional users at ${additionalUsers} each)`
                : 'user',
          },
        ],
      },
      {
        name: 'File Upload Limits',
        childrent: [
          { bold: displayStorage(plan.document_size_limit), normal: 'max file size' },
          { bold: displayStorage(Number(plan.storage_limit)), normal: 'storage' },
        ],
      },
      {
        name: 'Features',
        childrent: [
          { bold: 'OCR', normal: 'support' },
          { bold: '', normal: 'Chat with folders' },
          ...(name === PlansName.Policy_Pro
            ? [
                { bold: 'Policy Analyzer', normal: 'unlimited policy summaries' },
                {
                  bold: 'Advanced Insurance Policy Analytics',
                  normal: 'Fine-tuned for optimal performance',
                },
              ]
            : []),
        ],
      },
      {
        name: 'Support',
        childrent:
          name === PlansName.Policy_Pro
            ? [
                {
                  bold: 'Priority email assistance',
                  normal: 'faster response times for policy pro users',
                },
              ]
            : [{ bold: 'Standard', normal: 'email assistance' }],
      },
      {
        name: 'AI Technology',
        childrent: [{ bold: 'GPT Model', normal: 'most advanced version' }],
      },
    ],
  };
};

const getSpecialPlan = (name: string, isCustom: boolean, plan?: ISubscriptionPlan) => {
  return {
    id: isCustom ? plan?.id : 'Cus',
    name: name,
    prices: plan?.prices || null,
    description: [
      {
        name: 'Support Function',
        childrent: [
          {
            bold: isCustom ? displayStorage(plan?.storage_limit as number) : 'Unlimited',
            normal: 'storage Limit',
          },
          {
            bold: isCustom ? displayStorage(plan?.document_size_limit as number) : 'Unlimited',
            normal: 'document Size Limit',
          },
        ],
      },
      {
        name: 'User Preferences',
        childrent: [
          { bold: '', normal: 'Chat with files' },
          { bold: '', normal: 'Chat with folders' },
        ],
      },
      {
        name: 'Support Function',
        childrent: [
          { bold: '', normal: 'Up to 10 editors' },
          { bold: '', normal: 'Policy Pro & Report card' },
          { bold: '', normal: 'Case Management Support' },
          { bold: '', normal: 'Discovery Pro & Interrogatories' },
        ],
      },
      {
        name: 'Customer Support',
        childrent: [
          { bold: '', normal: '8 hours of Support turnaround' },
          { bold: '', normal: 'Email' },
          { bold: '', normal: 'Phone' },
        ],
      },
    ],
  };
};

const BillingSubscription = () => {
  const { profileInfo } = useProfileStore();
  const searchParams = useSearchParams();
  const sttTrial = statusTrial(profileInfo?.current_subscription?.trial_period_end || null);

  const [annually, setAnnually] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<ISubscriptionPlan[]>([]);
  const [subSP, setSubSP] = useState<ISubscriptionPlanCustom[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [showContactUsForm, setShowContactUsForm] = useState(false);
  const [indexCurrentPlan, setIndexCurrentPlan] = useState(0);
  const [successMsg, setSuccessMsg] = useState<JSX.Element | string>('');

  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: successMsg,
  });

  const [isCurrenPlanTrial, setIsCurrenPlanTrial] = useState<string | null>(null);

  useEffect(() => {
    const currenPlanTrial =
      sttTrial === StatustrialPeriodEnd.DURING_TRIAL || sttTrial === StatustrialPeriodEnd.ENDED
        ? localStorage.getItem(STORAGE_ITEM_NAME.users_have_used_policy_pro)
          ? PlansName.Policy_Pro
          : PlansName.Premium
        : null;
    setIsCurrenPlanTrial(currenPlanTrial);
  }, [sttTrial]);

  const highlightPlan = searchParams.get('highlight') || isCurrenPlanTrial;

  const [typeForEveryOne, setTypeForEveryOne] = useState(
    highlightPlan && highlightPlan === PlansName.Policy_Pro ? false : true,
  );

  // const getSubscriptionPlans = async (): Promise<Plan[]> => {
  const getSubscriptionPlans = async () => {
    try {
      const url = '/api/plg/productization/subscription-plans/';
      const response = await axios.get(url);
      if (response.status === 200) {
        const plans = response.data.results;
        console.log('response :>> ', plans);
        // const consularSubscription = getSpecialPlan('Consular', false);

        const subscriptionPlansNew = plans.map((plan: ISubscriptionPlan) => {
          switch (plan?.name) {
            case PlansName.Plus:
              return getNormalPlan(PlansName.Plus, plan);
              break;
            case PlansName.Premium:
              return getNormalPlan(PlansName.Premium, plan);
              break;
            case PlansName.Policy_Pro:
              return getNormalPlan(PlansName.Policy_Pro, plan);
              break;
            case PlansName.Esquire:
              return getSpecialPlan(PlansName.Esquire, true, plan);
              break;
            default:
              break;
          }
        });
        setSubscriptionPlans(plans);
        setSubSP(subscriptionPlansNew);
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      await getSubscriptionPlans();
    };

    fetchPlans();
  }, []);

  const getAccountsProfile = async () => {
    try {
      const url = '/api/plg/accounts/profile/';
      const response = await axios.get(url);
      if (response.status === 200) {
        setCurrentPlan(
          response.data?.current_subscription
            ? response.data?.current_subscription?.subscription_plan?.name
            : null,
        );
      }
    } catch (error) {
      console.log('error :>> ', error);
    }
  };

  const handleToastMsg = (intent: ToastIntent, msg: string) => {
    setShowContactUsForm(false);
    setIntent(intent);
    setSuccessMsg(msg);
    showToast();
  };

  const { isFetching: subscriptionPlansLoading } = useQuery(
    [SETTING_SUBSCRIPTION_PLAN],
    getSubscriptionPlans,
    {
      refetchOnWindowFocus: false,
    },
  );
  const { isFetching: accountsProfileLoading } = useQuery(
    [SETTING_ACCOUNT_PROFILE],
    getAccountsProfile,
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    // set plan default
    // if (!currentPlan && subscriptionPlans.length) {
    //   setCurrentPlan(subscriptionPlans[0]?.name);
    // }
    if (currentPlan) {
      subscriptionPlans.map((item, idx) => {
        if (item.name === currentPlan) {
          setIndexCurrentPlan(idx);
        }
      });
    }
  }, [subscriptionPlans, currentPlan]);

  const onChangeSwitch = (val: React.ChangeEvent<HTMLInputElement>) => {
    setAnnually(val.target.checked);
  };

  if (subscriptionPlansLoading || accountsProfileLoading) {
    return (
      <div className='size-full items-center justify-center'>
        <Spinner />
      </div>
    );
  }

  return (
    <div className='overflow-auto px-10'>
      <div className='flex justify-center text-center text-[2rem] font-medium leading-8'>
        Choose a plan that’s right for you!
      </div>
      <div className='m-auto mt-8 flex size-fit items-center justify-center rounded-lg bg-bg-btn-disable p-[0.1875rem] font-medium text-[#64646C]'>
        <div
          className={classNames(
            'flex cursor-pointer items-center justify-center rounded-md px-3 py-[0.6875rem] text-sm md:px-12',
            {
              'bg-neutrual-700 font-bold text-neutrual-25': typeForEveryOne,
            },
          )}
          onClick={() => setTypeForEveryOne(true)}
        >
          For Everyone
        </div>
        <div
          className={classNames(
            'flex cursor-pointer items-center justify-center rounded-md px-3 py-[0.6875rem] text-sm md:px-12',
            {
              'bg-neutrual-700 font-bold text-neutrual-25': !typeForEveryOne,
            },
          )}
          onClick={() => setTypeForEveryOne(false)}
        >
          For Professionals
        </div>
      </div>
      <div className='mt-10 flex items-center justify-center gap-4'>
        <div className='cursor-pointer text-base font-medium text-neutrual-700'>Pay monthly</div>
        <div className='switch-button'>
          <input
            type='checkbox'
            id='switch'
            style={{ display: 'none' }}
            checked={annually}
            onChange={onChangeSwitch}
          />
          <label
            htmlFor='switch'
            style={{
              display: 'block',
              width: '3.3125rem',
              height: '1.875rem',
              borderRadius: '2rem',
              backgroundColor: annually ? '#DBDBDE' : '#C5F6D9',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                display: 'block',
                width: '1.625rem',
                height: '1.625rem',
                borderRadius: '50%',
                backgroundColor: annually ? '#FFFFFF' : '#418C61',
                position: 'absolute',
                top: '0.125rem',
                transform: annually ? 'translateX(0%)' : 'translateX(4px) translateX(76%)',
                left: '0.125rem',
                transition: 'transform 0.2s',
              }}
            />
          </label>
        </div>
        <div className='relative cursor-pointer text-base font-medium text-neutrual-700'>
          Pay yearly
          <div className='absolute bottom-[-1.55rem] right-[-11.25rem] flex items-center'>
            <Image
              alt=''
              className='rotate-6 object-cover'
              src='/svg/discount-arrow.svg'
              width='65'
              height='80'
              priority
            />
            <div className='mt-7 size-fit whitespace-nowrap rounded-full bg-middle-green px-[0.8125rem] py-[0.125rem] font-bold !text-[#F3F3F3] text-aero-7'>
              Save 20%
            </div>
          </div>
        </div>
      </div>
      <div className='m-auto mt-14 flex w-fit justify-center gap-6'>
        {typeForEveryOne
          ? subSP?.slice(0, 2).map((item, idx) => {
              return (
                <SubscriptionPlanNew
                  key={item.id}
                  annually={annually}
                  subscriptionPlan={item}
                  currentPlan={currentPlan}
                  indexCurrentPlan={indexCurrentPlan}
                  showContactUsForm={() => setShowContactUsForm(true)}
                  idx={idx}
                  typeForEveryOne={typeForEveryOne}
                  highlightPlan={highlightPlan}
                />
              );
            })
          : subSP?.slice(2).map((item, idx) => {
              return (
                <SubscriptionPlanNew
                  key={item.id}
                  annually={annually}
                  subscriptionPlan={item}
                  currentPlan={currentPlan}
                  indexCurrentPlan={indexCurrentPlan}
                  showContactUsForm={() => setShowContactUsForm(true)}
                  idx={idx + 2}
                  typeForEveryOne={typeForEveryOne}
                  highlightPlan={highlightPlan}
                />
              );
            })}
      </div>
      {showContactUsForm && (
        <ContactUsFormPopUp
          open={showContactUsForm}
          onCancel={() => setShowContactUsForm(false)}
          handleToastMessage={handleToastMsg}
        />
      )}
      {toasterComponent}
    </div>
  );
};

export default BillingSubscription;

BillingSubscription.displayName = 'BillingSubscription';
