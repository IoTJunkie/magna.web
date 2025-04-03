import { StatustrialPeriodEnd } from '@/config';
import dayjs from 'dayjs';

export const isTrialEnded: any = (trialPeriodEnd: string | null) => {
  if (trialPeriodEnd) {
    const trialEndDate = dayjs(trialPeriodEnd);
    const now = dayjs();
    return now.isAfter(trialEndDate);
  }

  return true;
};

export const statusTrial = (trialPeriodEnd: string | null) => {
  if (trialPeriodEnd === null) {
    return StatustrialPeriodEnd.UPGRADED;
  } else {
    const time = dayjs(trialPeriodEnd);
    const now = dayjs();

    const isLessThan24 = time.diff(now, 'hour') > 0 && time.diff(now, 'hour') < 24;
    const isEnded = now.isAfter(time);
    return isLessThan24
      ? StatustrialPeriodEnd.DURING_TRIAL_LESS_24
      : isEnded
        ? StatustrialPeriodEnd.ENDED
        : StatustrialPeriodEnd.DURING_TRIAL;
  }
};
