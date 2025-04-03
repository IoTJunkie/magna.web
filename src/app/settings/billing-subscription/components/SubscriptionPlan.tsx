import CustomIcon from '@/app/_components/common/CustomIcon';
import { useProfileStore } from '@/app/_components/profile/profile-store';
import useToastComponent from '@/app/hooks/Toast';
import { ISubscriptionPlan, Plan } from '@/app/types/billingAndSub';
import { isTrialEnded } from '@/app/utils/checkTrialEnded';
import { SETTING_ACCOUNT_PROFILE, SETTING_SUBSCRIPTION_PLAN, USER_PROFILE } from '@/config';
import { PlansName } from '@/config/constants';
import { useSupscriptionPlan } from '@/contexts/SubscriptionPlanContext';
import { Spinner, ToastIntent } from '@fluentui/react-components';
import axios from 'axios';
import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { purchasePlanstatus } from '@/app/constant';

interface IProps {
  subscriptionPlan: ISubscriptionPlan;
  annually: boolean;
  currentPlan: string | null;
  indexCurrentPlan: number;
  idx: number;
  showContactUsForm: () => void;
  plans: any[];
}

const SubscriptionPlan = (props: IProps) => {
  const { subscriptionPlan, annually, currentPlan, indexCurrentPlan, idx, plans } = props;
  const searchParams = useSearchParams();
  const { update } = useSession();
  const router = useRouter();
  const [msgPayment, setMsgPayment] = useState('');
  const refFirstRender = useRef(true);
  const { profileInfo } = useProfileStore();
  const subscriptionPlanSelected = useRef<null | string>(null);
  const priceItem = subscriptionPlan.prices.find(
    (subscriptionPlan) => subscriptionPlan.billing_cycle === (annually ? 'annual' : 'monthly'),
  );
  const { isUpgradeLoading, setUpgradeLoading } = useSupscriptionPlan();
  const disableSubscriptionPlan =
    isUpgradeLoading && priceItem?.price_id !== subscriptionPlanSelected.current;
  const disableLowerSubscriptionPlan =
    idx < indexCurrentPlan && !profileInfo?.current_subscription?.trial_period_end;
  const queryClient = useQueryClient();

  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: msgPayment,
  });

  const handleToastMsg = (intent: ToastIntent, msg: string) => {
    setIntent(intent);
    setMsgPayment(msg);
    showToast();
  };

  const trialHasEnded = isTrialEnded(profileInfo?.current_subscription?.trial_period_end as string);
  const isTrialPlan = !!profileInfo?.current_subscription?.trial_period_end;

  const isPremiunPlan = subscriptionPlan?.name === PlansName.Premium;
  const isPolicyPlan = subscriptionPlan?.name === PlansName.Policy_Pro;
  const isEsquire = subscriptionPlan?.name === PlansName.Esquire;
  const isConsular = subscriptionPlan?.name === 'Consular';

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
      className={classNames('relative h-auto w-[11.25rem] rounded-[0.5rem] p-4 md:w-[13.75rem]', {
        'border-2 border-[#2c5d404d] border-opacity-30 ':
          currentPlan && currentPlan === subscriptionPlan?.name,
        'bg-[#C5F6D9] bg-opacity-10': isPremiunPlan,
        'bg-[#C5F6D9] bg-opacity-25': isPolicyPlan,
        'bg-[#C5F6D9] bg-opacity-40': isEsquire,
        'bg-[#C5F6D9] bg-opacity-60': isConsular,
      })}
      key={subscriptionPlan.id}
    >
      <div className='flex items-center justify-center gap-[0.375rem]'>
        {isPolicyPlan && <CustomIcon width={20} height={20} name='policy-pro' />}
        {isEsquire && <CustomIcon width={20} height={20} name='esquire' />}
        {isConsular && <CustomIcon width={20} height={20} name='consular' />}
        <p className='text-center font-sans text-xl font-medium not-italic leading-8 text-color-menu-default'>
          {subscriptionPlan.name}
        </p>
      </div>

      <div className='relative mt-2 h-[3.75rem] text-center leading-[3.75rem]'>
        {priceItem && !subscriptionPlan?.is_consular && (
          <div className='flex items-center justify-center' key={subscriptionPlan.id}>
            <h3 className='text-[1.3rem] font-medium leading-[2rem] text-color-menu-default'>
              {`$${Number(priceItem?.amount || 0)}`}
            </h3>
            <p className='text-[0.922875rem] font-normal leading-[1.171875rem] tracking-[-0.013125rem] text-color-text-default opacity-50'>
              /month
            </p>
          </div>
        )}
        {subscriptionPlan?.is_consular && (
          <div className='relative mt-2 h-[3.75rem] text-center leading-[3.75rem]'>
            <h3 className='font-inter text-center text-[0.922875rem] font-normal leading-[1.171875rem] tracking-[-0.013125rem] text-color-text-default'>
              Contact us
            </h3>
          </div>
        )}
        {isPolicyPlan && (
          <div className='absolute bottom-[-25%] left-1/2 flex w-[5.75rem] -translate-x-1/2 items-center rounded-[0.25rem] bg-[#FFE680] p-[0.25rem]'>
            <CustomIcon name='best-value-icon' height={18} width={18} />
            <p className='font-inter ml-[0.3125rem]  text-center text-[0.625rem] font-semibold leading-[0.75rem] text-black'>
              BEST VALUE
            </p>
          </div>
        )}
        {isEsquire && (
          <div className='absolute bottom-[-25%] left-1/2 flex w-[8.8rem] -translate-x-1/2 items-center rounded-[0.25rem] bg-[#FFE680] p-[0.25rem]'>
            <CustomIcon name='high-perfomance' height={18} width={18} />
            <p className='font-inter ml-[0.3125rem] text-center text-[0.625rem] font-semibold leading-[0.75rem] text-black'>
              HIGH PERFORMANCE
            </p>
          </div>
        )}
      </div>
      <div
        className={classNames(
          'mb-[4.875rem] mt-[3.75rem] flex flex-col items-center justify-center gap-3',
        )}
      >
        {plans
          .filter((plan: any) => plan.name === subscriptionPlan.name)
          .map((plan) => (
            <div
              className={classNames('w-full rounded-[0.5rem] py-3 xl:px-2', {
                'py-4': plan.name.length === 0,
                '!py-[1.4rem]':
                  plan.name === 'Policy Pro with ultimate Policy Report Card' ||
                  plan.name === 'Access powerful tools for enhanced functionality',
              })}
              key={plan.name}
            >
              <div className='text-sm font-normal'>
                <div className='font-inter flex flex-col gap-[3.375rem] text-center text-[0.875rem] font-normal leading-[1.25rem] text-color-text-default'>
                  <div>
                    <div className='py-3.5 leading-[1.375rem] md:px-2'>
                      {typeof plan.storageLimit === 'number'
                        ? plan.storageLimit >= 1000 * 1000 * 1000
                          ? `${plan.storageLimit / (1000 * 1000 * 1000)} GB`
                          : `${plan.storageLimit / (1000 * 1000)} MB`
                        : 'Unlimited'}
                    </div>
                    <div className='py-3.5 leading-[1.375rem] md:px-2'>
                      {typeof plan.documentSizeLimit === 'number'
                        ? plan.documentSizeLimit >= 1000 * 1000 * 1000
                          ? `${plan.documentSizeLimit / (1000 * 1000 * 1000)} GB`
                          : `${plan.documentSizeLimit / (1000 * 1000)} MB`
                        : 'Unlimited'}
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-center py-3.5 leading-[1.375rem] md:px-2'>
                      {plan.chatWithFiles === true ? (
                        <Image src='/svg/success-circle.svg' alt='' width={22} height={22} />
                      ) : (
                        <span className='font-inter relative w-[0.9375rem] text-center text-[0.922875rem] font-normal leading-[1.40625rem] tracking-[-0.013125rem] text-[#131117]'>
                          <span className='invisible'>-</span>
                          <div className='absolute inset-y-0 left-1/2 top-1/2 h-[0.03125rem] w-[0.9375rem] -translate-x-1/2 -translate-y-1/2 bg-color-text-default' />
                        </span>
                      )}
                    </div>
                    <div className='relative flex justify-center py-3.5 leading-[1.375rem] md:px-2'>
                      {plan.chatWithFolders && plan.discoveryToolInterrogatories ? (
                        <div className='flex flex-col items-center'>
                          <Image src='/svg/success-circle.svg' alt='' width={22} height={22} />
                          <span className='absolute top-10 text-xs'>
                            Integrate with Case Management
                          </span>
                        </div>
                      ) : plan.chatWithFolders ? (
                        <div className='flex flex-col items-center gap-2'>
                          <Image src='/svg/success-circle.svg' alt='' width={22} height={22} />
                        </div>
                      ) : (
                        <span className='font-inter relative w-[0.9375rem] text-center text-[0.922875rem] font-normal leading-[1.40625rem] tracking-[-0.013125rem] text-[#131117]'>
                          <span className='invisible'>-</span>
                          <div className='absolute inset-y-0 left-1/2 top-1/2 h-[0.03125rem] w-[0.9375rem] -translate-x-1/2 -translate-y-1/2 bg-color-text-default' />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {typeof plan.maximumMember === 'string' ? (
                      <div className='py-3.5 leading-[1.375rem] md:px-2'>{plan.maximumMember}</div>
                    ) : typeof plan.maximumMember === 'number' && plan.maximumMember > 0 ? (
                      <div className='py-3.5 leading-[1.375rem] md:px-2'>
                        {`${plan.maximumMember} members`}
                      </div>
                    ) : (
                      <div className='py-3.5 leading-[1.375rem] md:px-2'>
                        <span className='font-inter relative w-[0.9375rem] text-center text-[0.922875rem] font-normal leading-[1.40625rem] tracking-[-0.013125rem] text-[#131117]'>
                          <span className='invisible'>-</span>
                          <div className='absolute inset-y-0 left-1/2 top-1/2 h-[0.03125rem] w-[0.9375rem] -translate-x-1/2 -translate-y-1/2 bg-color-text-default' />
                        </span>
                      </div>
                    )}

                    <div className='flex justify-center px-2 py-[1.5625rem] leading-[1.375rem]  md:py-3.5'>
                      {plan.policyAnalyzerReportCard === true ? (
                        <Image src='/svg/success-circle.svg' alt='' width={22} height={22} />
                      ) : (
                        <span className='font-inter relative w-[0.9375rem] text-center text-[0.922875rem] font-normal leading-[1.40625rem] tracking-[-0.013125rem] text-[#131117]'>
                          <span className='invisible'>-</span>
                          <div className='absolute inset-y-0 left-1/2 top-1/2 h-[0.03125rem] w-[0.9375rem] -translate-x-1/2 -translate-y-1/2 bg-color-text-default' />
                        </span>
                      )}
                    </div>
                    <div className='flex justify-center px-2 py-[1.43rem] leading-[1.375rem]'>
                      {plan.supportMycase === true ? (
                        <Image src='/svg/success-circle.svg' alt='' width={22} height={22} />
                      ) : (
                        <span className='font-inter relative w-[0.9375rem] text-center text-[0.922875rem] font-normal leading-[1.40625rem] tracking-[-0.013125rem] text-[#131117]'>
                          <span className='invisible'>-</span>
                          <div className='absolute inset-y-0 left-1/2 top-1/2 h-[0.03125rem] w-[0.9375rem] -translate-x-1/2 -translate-y-1/2 bg-color-text-default' />
                        </span>
                      )}
                    </div>
                    <div className='flex justify-center px-2 py-[1.5625rem] leading-[1.375rem]'>
                      {plan.discoveryToolInterrogatories === true ? (
                        <Image src='/svg/success-circle.svg' alt='' width={22} height={22} />
                      ) : (
                        <span className='font-inter relative w-[0.9375rem] text-center text-[0.922875rem] font-normal leading-[1.40625rem] tracking-[-0.013125rem] text-[#131117]'>
                          <span className='invisible'>-</span>
                          <div className='absolute inset-y-0 left-1/2 top-1/2 h-[0.03125rem] w-[0.9375rem] -translate-x-1/2 -translate-y-1/2 bg-color-text-default' />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-center py-3.5 leading-[1.375rem] md:px-2'>
                      {plan.customerSupportEmail === true ? (
                        <Image src='/svg/success-circle.svg' alt='' width={22} height={22} />
                      ) : (
                        <span className='font-inter relative w-[0.9375rem] text-center text-[0.922875rem] font-normal leading-[1.40625rem] tracking-[-0.013125rem] text-[#131117]'>
                          <span className='invisible'>-</span>
                          <div className='absolute inset-y-0 left-1/2 top-1/2 h-[0.03125rem] w-[0.9375rem] -translate-x-1/2 -translate-y-1/2 bg-color-text-default' />
                        </span>
                      )}
                    </div>
                    <div className='flex justify-center py-3.5 leading-[1.375rem] md:px-2'>
                      {plan.customerSupportPhone === true ? (
                        <Image src='/svg/success-circle.svg' alt='' width={22} height={22} />
                      ) : (
                        <span className='font-inter relative w-[0.9375rem] text-center text-[0.922875rem] font-normal leading-[1.40625rem] tracking-[-0.013125rem] text-[#131117]'>
                          <span className='invisible'>-</span>
                          <div className='absolute inset-y-0 left-1/2 top-1/2 h-[0.03125rem] w-[0.9375rem] -translate-x-1/2 -translate-y-1/2 bg-color-text-default' />
                        </span>
                      )}
                    </div>
                    <div className='py-3.5 leading-[1.375rem] md:px-2'>
                      {plan.supportTurnaround && `${plan.supportTurnaround} hours`}
                    </div>
                    <div className='flex justify-center py-3.5 leading-[1.375rem] md:px-2'>
                      {plan.trialPeriod !== null ? (
                        `${plan.trialPeriod} days`
                      ) : (
                        <span className='font-inter relative w-[0.9375rem] text-center text-[0.922875rem] font-normal leading-[1.40625rem] tracking-[-0.013125rem] text-[#131117]'>
                          <span className='invisible'>-</span>
                          <div className='absolute inset-y-0 left-1/2 top-1/2 h-[0.03125rem] w-[0.9375rem] -translate-x-1/2 -translate-y-1/2 bg-color-text-default' />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className='absolute bottom-4 left-4 w-[calc(100%-2rem)]'>
        <div
          className={classNames(
            'flex h-12 w-full items-center justify-center gap-2 rounded text-2xl font-medium ',
            {
              // 'bg-[#FEF0C7] text-aero-17': isUpgradeLoading,
              'bg-aero-2 text-aero-8': !isUpgradeLoading,
              'cursor-pointer !bg-aero-2 !text-aero-8':
                subscriptionPlan?.name !== currentPlan ||
                (subscriptionPlan?.name === currentPlan && isTrialPlan),
              'cursor-not-allowed': subscriptionPlan?.name === currentPlan && !isTrialPlan,
              '!bg-bg-btn-disable !text-text-btn-disable': isUpgradeLoading,
              invisible: disableLowerSubscriptionPlan,
            },
          )}
          onClick={() => {
            subscriptionPlan.is_consular
              ? props.showContactUsForm()
              : !disableSubscriptionPlan &&
                (subscriptionPlan?.name !== currentPlan ||
                  (subscriptionPlan?.name === currentPlan && isTrialPlan)) &&
                priceItem &&
                handleUpgradePlan(priceItem?.price_id);
          }}
        >
          {isUpgradeLoading && !disableSubscriptionPlan && <Spinner size='tiny' />}
          {subscriptionPlan.is_consular
            ? purchasePlanstatus.contactUs
            : isUpgradeLoading && !disableSubscriptionPlan
              ? purchasePlanstatus.inprogress
              : subscriptionPlan?.name === currentPlan && !isTrialPlan
                ? purchasePlanstatus.current
                : isTrialPlan && subscriptionPlan?.name === currentPlan
                  ? purchasePlanstatus.continue
                  : purchasePlanstatus.upgrade}
        </div>
      </div>
      {toasterComponent}
    </div>
  );
};

export default React.memo(SubscriptionPlan);
