import { UserProfile } from '../types/userProfile';

export const isEnablePolicyAnalyzer = (profileInfo: UserProfile | undefined): boolean => {
  let result = false;
  if (profileInfo !== undefined && profileInfo.current_subscription !== null) {
    result =
      profileInfo?.current_subscription?.subscription_plan?.policy_analyzer_report_card || false;

    // profileInfo.current_subscription.subscription_plan.descriptions.forEach((item) => {
    //   if (item.includes('Policy Analyzer')) {
    //     result = true;
    //   }
    // });
  }
  return result;
};

export const isEnableDiscoveryTool = (profileInfo: UserProfile | undefined): boolean => {
  let result = false;
  if (profileInfo !== undefined && profileInfo.current_subscription !== null) {
    result =
      profileInfo?.current_subscription?.subscription_plan?.discovery_tool_interrogatories || false;
    // profileInfo.current_subscription.subscription_plan.descriptions.forEach((item) => {
    //   if (item.includes('Discovery')) {
    //     result = true;
    //   }
    // });
  }
  return result;
};
