import { IPrice, ISubscriptionPlan } from './billingAndSub';

export interface UserProfile {
  address_line_1: string;
  address_line_2: string;
  city: string;
  country: string;
  email: string;
  current_subscription: {
    subscription_plan: ISubscriptionPlan;
    subscription_id: string;
    price_plan: IPrice;
    trial_period_end: string;
  };
  team?: {
    team_id: string;
    is_owner: boolean;
  };
  first_name: string;
  languages: string;
  last_name: string;
  mobile: string;
  phone: string;
  state: string;
  zip_code: string;
  avatar_url: string | null;
  active_ocr_support: boolean;
  trial_period_end: string;
}
