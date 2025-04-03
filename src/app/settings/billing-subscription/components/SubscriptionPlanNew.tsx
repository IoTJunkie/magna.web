import { useProfileStore } from '@/app/_components/profile/profile-store';
import useToastComponent from '@/app/hooks/Toast';
import { ISubscriptionPlanCustom } from '@/app/types/billingAndSub';
import {
  PlansName,
  SETTING_ACCOUNT_PROFILE,
  SETTING_SUBSCRIPTION_PLAN,
  USER_PROFILE,
} from '@/config';
import { useSupscriptionPlan } from '@/contexts/SubscriptionPlanContext';
import { Button, Spinner, ToastIntent } from '@fluentui/react-components';
import axios from 'axios';
import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';

interface IProps {
  subscriptionPlan: ISubscriptionPlanCustom;
  annually: boolean;
  currentPlan: string | null;
  indexCurrentPlan: number;
  showContactUsForm: () => void;
  idx: number;
  typeForEveryOne: boolean;
  highlightPlan?: string | null;
}

const SubscriptionPlanNew = ({
  subscriptionPlan,
  annually,
  currentPlan,
  idx,
  indexCurrentPlan,
  showContactUsForm,
  typeForEveryOne,
  highlightPlan,
}: IProps) => {
  const { profileInfo } = useProfileStore();
  const { isUpgradeLoading, setUpgradeLoading } = useSupscriptionPlan();
  const queryClient = useQueryClient();
  const { update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [msgPayment, setMsgPayment] = useState('');
  const refFirstRender = useRef(true);
  const subscriptionPlanSelected = useRef<null | string>(null);

  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: msgPayment,
  });
  const handleToastMsg = (intent: ToastIntent, msg: string) => {
    setIntent(intent);
    setMsgPayment(msg);
    showToast();
  };

  const isCurrentPlan = subscriptionPlan.name === currentPlan;
  const isTrialPlan = profileInfo?.current_subscription?.trial_period_end;
  const isEsquirePlan = subscriptionPlan.name === PlansName.Esquire;
  // const disableLowerSubscriptionPlan = idx < indexCurrentPlan && !isTrialPlan;
  const priceItem =
    subscriptionPlan?.prices && subscriptionPlan?.prices.length
      ? subscriptionPlan?.prices.find(
          (subscriptionPlan) =>
            subscriptionPlan.billing_cycle === (annually ? 'monthly' : 'annual'),
        )
      : null;
  const isHighlightPlan = highlightPlan && highlightPlan === subscriptionPlan.name;

  const handleUpgradePlanSuccess = async () => {
    if (refFirstRender.current) {
      update({ triggerRefreshToken: true });
      refFirstRender.current = false;
      handleToastMsg('success', "Payment successful! You'll receive a confirmation email shortly.");
      queryClient.invalidateQueries([SETTING_SUBSCRIPTION_PLAN, SETTING_ACCOUNT_PROFILE]);
      router.push('/settings/billing-subscription/');
    }
  };
  useEffect(() => {
    const paymentSuccess = searchParams.get('success');
    if (paymentSuccess === 'true') {
      handleUpgradePlanSuccess();
    }
    if (paymentSuccess === 'false') {
      handleToastMsg(
        'error',
        'Payment unsuccessful. Please review your payment information and try again.',
      );
      router.push('/settings/billing-subscription/');
    }
  }, []);

  const handleUpgradePlan = async (priceId: string) => {
    if (priceId && !isUpgradeLoading) {
      try {
        subscriptionPlanSelected.current = priceId;
        setUpgradeLoading(true);
        const url = '/api/plg/productization/create-checkout-session/';
        const params = {
          price_id: priceId,
          web_domain: process.env.NEXT_PUBLIC_WEB_DOMAIN,
          cancel_url: `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/settings/billing-subscription?success=false`,
          success_url: `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/settings/billing-subscription?success=true`,
        };
        const res = await axios.post(url, params);
        if (res.status === 200) {
          queryClient.invalidateQueries(USER_PROFILE);
          const url = res.data?.url;
          if (url) {
            setUpgradeLoading(false);
            window.open(url, '_self');
          }
        }
      } catch (error) {
        setUpgradeLoading(false);
        console.log('error', error);
      }
    }
  };

  return (
    <div
      className={classNames(
        'h-auto w-full min-w-[20.625rem] max-w-[22.375rem] rounded-2xl border border-neutrual-50 p-6',
        {
          '!border-2 !border-middle-green': isCurrentPlan,
          '!border-middle-green': isHighlightPlan,
        },
      )}
    >
      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-3 text-base font-medium text-granite-gray'>
          {subscriptionPlan.name}
          {subscriptionPlan.name === PlansName.Policy_Pro && (
            <div className='flex items-center gap-2 rounded-[1.25rem] border border-neutrual-700 px-2 py-[0.125rem] text-xs font-medium text-neutrual-700'>
              <Image alt='' src={'/svg/like.svg'} width={20} height={20} />
              Best value
            </div>
          )}
          {isEsquirePlan && (
            <div className='flex items-center gap-2 rounded-[1.25rem] border border-neutrual-700 px-2 py-[0.125rem] text-xs font-medium text-neutrual-700'>
              <Image alt='' src={'/svg/flash.svg'} width={20} height={20} />
              High performance
            </div>
          )}
        </div>
        <div className='flex items-center gap-1 font-semibold text-neutrual-800'>
          {isEsquirePlan ? (
            <div className='my-5 text-[2rem] text-neutrual-800'>Coming Soon</div>
          ) : (
            <>
              <div className='text-[2rem]'>
                ${annually ? subscriptionPlan.prices[1].amount : subscriptionPlan.prices[0].amount}
              </div>
              <div className='text-xl'>/month</div>
            </>
          )}
        </div>
        {!isEsquirePlan && (
          <div className='text-granite-gray] text-sm'>Billed {annually ? 'monthly' : 'yearly'}</div>
        )}
        {isTrialPlan && isCurrentPlan ? (
          <div className='!mt-3 flex flex-col gap-4'>
            <Button appearance='primary' size='large' className='!font-medium' disabled>
              On Free Trial
            </Button>
            <Button
              appearance='primary'
              size='large'
              className={'mt-3 flex items-center gap-2 font-medium'}
              onClick={() => priceItem?.price_id && handleUpgradePlan(priceItem?.price_id)}
            >
              {isUpgradeLoading && <Spinner size='tiny' />}
              Buy plan
            </Button>
          </div>
        ) : isCurrentPlan ? (
          <Button appearance='primary' size='large' className='!mt-3 !font-medium' disabled>
            Your current plan
          </Button>
        ) : isEsquirePlan ? (
          <Button
            appearance='primary'
            size='large'
            className='!mt-3 flex items-center gap-2 border-middle-green !font-medium'
            onClick={showContactUsForm}
          >
            Join Waitlist
          </Button>
        ) : (
          <Button
            appearance={`${isHighlightPlan ? 'primary' : 'outline'}`}
            size='large'
            className={classNames(
              '!mt-3 flex items-center gap-2 border-middle-green !font-medium !text-middle-green',
              {
                // '!bg-neutrual-25 !text-neutral-300': disableLowerSubscriptionPlan,
                '!text-white': isHighlightPlan,
              },
            )}
            // disabled={disableLowerSubscriptionPlan}
            onClick={() => priceItem?.price_id && handleUpgradePlan(priceItem?.price_id)}
          >
            {isUpgradeLoading && subscriptionPlan.name === currentPlan && <Spinner size='tiny' />}
            Buy plan
          </Button>
        )}

        <div className='my-3 h-[0.0625rem] w-full bg-[#DBDBDE]' />
        {subscriptionPlan.description.map((item) => (
          <div className='mb-6 flex flex-col gap-3' key={item.name}>
            <div>
              <div className='mb-3 text-sm font-semibold'>{item.name}</div>
              <div className='flex flex-col gap-3'>
                {item.childrent.map((child) => {
                  return (
                    <div
                      className='flex items-center gap-3'
                      key={`${child.normal}-${annually}-${typeForEveryOne}`}
                    >
                      <div className='flex size-[1.375rem] min-w-[1.3125rem] items-center justify-center rounded-full bg-[#C5F6D9]'>
                        <Image alt='' src='/svg/success-icon.svg' width='14' height='14' />
                      </div>
                      <div className='break-words'>
                        {child.bold ? (
                          <span className='font-semibold text-dark-liver'>{child.bold}</span>
                        ) : (
                          ''
                        )}{' '}
                        {child.normal}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      {toasterComponent}
    </div>
  );
};
export default SubscriptionPlanNew;
