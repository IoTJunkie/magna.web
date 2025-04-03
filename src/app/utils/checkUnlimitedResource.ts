import { UserProfile } from '../types/userProfile';
import { PlansName } from '@/config';

export const isUnlimitedResource = (profile: UserProfile | undefined): boolean => {
  if (profile === undefined) {
    return false;
  }
  const currentPlan = profile?.current_subscription?.subscription_plan?.name;
  if (currentPlan === PlansName.Policy_Pro || currentPlan === PlansName.Esquire) {
    return true;
  }
  return false;
};
