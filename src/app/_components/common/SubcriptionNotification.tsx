import { statusTrial } from '@/app/utils/checkTrialEnded';
import Image from 'next/image';
import { useProfileStore } from '../profile/profile-store';
import { PlansName, StatustrialPeriodEnd, STORAGE_ITEM_NAME } from '@/config';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components';

const SubcriptionNotification = () => {
  const { profileInfo } = useProfileStore();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const refFirstTimeShow = useRef(true);
  const sttTrial = statusTrial(profileInfo?.current_subscription?.trial_period_end || null);

  const trialEnded = sttTrial === StatustrialPeriodEnd.ENDED;
  const trialDuring24h = sttTrial === StatustrialPeriodEnd.DURING_TRIAL_LESS_24;

  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const [firstTimeLogin, setFirstTimeLogin] = useState<string | null>(null);

  useEffect(() => {
    const storedDataUsedPolicy = localStorage.getItem(STORAGE_ITEM_NAME.users_have_used_policy_pro);
    const storeDataFirstTimeLogin = localStorage.getItem(STORAGE_ITEM_NAME.first_time_login);
    setRecommendedPlan(storedDataUsedPolicy);
    setFirstTimeLogin(storeDataFirstTimeLogin);
  }, []);

  useEffect(() => {
    if ((trialDuring24h || trialEnded) && firstTimeLogin) {
      setShow(true);
    }
  }, [trialEnded, trialEnded, firstTimeLogin]);

  const onRedirect = () => {
    setShow(false);
    router.push('/settings/billing-subscription/');
    refFirstTimeShow.current = false;
    localStorage.removeItem(STORAGE_ITEM_NAME.first_time_login);
  };
  const onCancel = () => {
    setShow(false);
    refFirstTimeShow.current = false;
    localStorage.removeItem(STORAGE_ITEM_NAME.first_time_login);
  };
  if (
    sttTrial === StatustrialPeriodEnd.DURING_TRIAL ||
    sttTrial === StatustrialPeriodEnd.UPGRADED
  ) {
    return null;
  }
  return (
    <div>
      <div
        className={classNames(
          'flex h-auto w-full flex-row items-center gap-4 py-3 pl-3 font-[600]',
          {
            'bg-[#FECDCA]': trialEnded,
            'bg-[#FFE680]': trialDuring24h,
          },
        )}
      >
        <Image
          alt='chat-warning-icon'
          src={`/svg/toast-${trialDuring24h ? 'warning' : 'error'}.svg`}
          width={32}
          height={32}
        />
        <div className='h-fit !text-[#161b26]'>
          {trialEnded ? (
            <>Your trial has expired! Upgrade your plan to continue using Magna!</>
          ) : trialDuring24h ? (
            <div className='flex items-center gap-1'>
              You have only 1 day left in your trial! Upgrade your plan to{' '}
              {recommendedPlan ? PlansName.Policy_Pro : PlansName.Policy_Pro} now to avoid losing
              access!
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <Dialog open={show && !!firstTimeLogin} modalType='alert'>
        <DialogSurface className='max-[38.125rem]:w-[90%] w-[37.5rem] sm:w-[50%] md:min-w-[26.25rem]'>
          <DialogBody>
            <DialogTitle className='!text-lg !font-semibold'>
              {trialEnded ? 'Access Restricted' : 'Your Free Trial Expires in 24 Hours!'}
            </DialogTitle>
            <DialogContent className='text-sm !text-support'>
              {trialEnded ? (
                <div className='my-4'>
                  Your free trial has expired, We hope you enjoyed exploring our platform!
                  <span role='img' aria-label='smiling face with smiling eyes'>
                    😊
                  </span>{' '}
                  <br />
                  Based on your activity, we recommend upgrading to{' '}
                  <b>{recommendedPlan ? PlansName.Policy_Pro : PlansName.Policy_Pro}</b> for the
                  best experience tailored to your needs.
                </div>
              ) : (
                <div className='my-4'>
                  Don’t miss out—upgrade now to keep accessing all the features you’ve been
                  exploring. Choose the plan that fits your needs and continue enjoying seamless
                  support and premium tools.
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <>
                <Button
                  className='!border-aero-10 !text-base !font-semibold'
                  size='large'
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  className='!bg-aero-7 !text-base !font-semibold !text-confirm'
                  size='large'
                  onClick={onRedirect}
                >
                  Choose Plan
                </Button>
              </>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default SubcriptionNotification;
