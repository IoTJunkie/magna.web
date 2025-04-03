import { useState } from 'react';
import CancelSubscriptionDialog from './CancelSubscriptionDialog';
import { ICurrentSubscription, ISubscriptionPlan } from '@/app/types/billingAndSub';
import { useRouter } from 'next/navigation';
import { isTrialEnded } from '@/app/utils/checkTrialEnded';
import dayjs from 'dayjs';
import CustomIcon from '@/app/_components/common/CustomIcon';

interface IDropdownProp {
  current_subscription: ICurrentSubscription | null;
  onCancel: () => void;
}

const Dropdown = (props: IDropdownProp) => {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const router = useRouter();

  const formatDate = (end_date: number | undefined) => {
    if (end_date) {
      let date = new Date(end_date * 1000);
      let infoDate = date.toDateString().split(' ');
      return `${infoDate[1]} ${infoDate[2]}, ${infoDate[3]}`;
    }
  };

  const handleSubscription = (isCancel: boolean) => {
    if (isCancel) {
      setShowDialog(true);
    } else {
      router.push('/settings/billing-subscription/');
    }
  };

  const trialHasEnded =
    isTrialEnded(props.current_subscription?.trial_period_end as string) &&
    props.current_subscription?.price_plan === null;

  return (
    <>
      <div className='mt-2 flex flex-row flex-wrap justify-between gap-2 pl-4'>
        <p className='flex items-center gap-2 whitespace-nowrap text-[1rem] font-[500]'>
          Current plan:{' '}
          <span className='relative flex items-center gap-1 text-color-menu-active'>
            {props.current_subscription
              ? props.current_subscription?.subscription_plan.name
              : 'Plus'}
            {props.current_subscription?.trial_period_end ? (
              <>
                <div className='flex gap-[0.125rem] rounded-lg bg-[#57BA81] px-2 py-1 text-sm text-white'>
                  Trial <CustomIcon name='free-trial' width={18} height={18} />
                </div>
              </>
            ) : (
              ''
            )}
          </span>{' '}
          <span className='text-[0.75rem] font-[400] leading-[1rem] text-neutral-300'>
            {props.current_subscription?.trial_period_end !== null
              ? `(${trialHasEnded ? 'expired on' : 'valid until'} ${dayjs(props.current_subscription?.trial_period_end).format('MMMM D, YYYY')})`
              : !props.current_subscription ||
                  props.current_subscription?.current_period_end === null
                ? `(renew on ${dayjs(props.current_subscription?.expired_at).format('MMMM D, YYYY')})`
                : `(valid until ${formatDate(props.current_subscription?.current_period_end)})`}
          </span>
        </p>
        <div
          className={`${props.current_subscription?.trial_period_end || props.current_subscription?.current_period_end ? 'text-aero-7' : 'text-color-critical'} cursor-pointer whitespace-nowrap text-sm font-semibold`}
          onClick={() =>
            handleSubscription(
              props.current_subscription?.trial_period_end === null &&
                props.current_subscription?.current_period_end === null,
            )
          }
        >
          {props.current_subscription?.trial_period_end
            ? 'Change Subscription'
            : props.current_subscription?.current_period_end
              ? 'Change Subscription'
              : 'Cancel Subscription'}
        </div>
      </div>
      {showDialog && (
        <CancelSubscriptionDialog
          open={showDialog}
          title={'Cancel Subscription'}
          content={
            'Are you sure you want to cancel your current subscription? If you cancel now, you can still access your '
          }
          onConfirm={() => {
            props.onCancel();
            setShowDialog(false);
          }}
          onCancel={() => setShowDialog(false)}
          plan={props.current_subscription?.subscription_plan.name}
          expriedDate={dayjs(props.current_subscription?.expired_at).format('MMMM D, YYYY')}
        />
      )}
    </>
  );
};

export default Dropdown;
