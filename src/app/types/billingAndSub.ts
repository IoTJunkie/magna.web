export interface IPrice {
  id: number;
  price_id: string;
  billing_cycle: string;
  amount: string;
  currency: string;
  plan: string;
}

export interface ISubscriptionPlan {
  id: string;
  prices: IPrice[];
  descriptions: string[];
  created: string;
  modified: string;
  name: string;
  status: boolean;
  credits: number;
  document_limit: number;
  question_limit: number;
  storage_limit: number | string;
  document_size_limit: number;
  chat_with_files: boolean;
  chat_with_folders: boolean;
  invite_team: boolean;
  maximum_member: number;
  is_consular: boolean;
  policy_analyzer_report_card: boolean;
  discovery_tool_interrogatories: boolean;
  customer_support_email: boolean;
  customer_support_phone: boolean;
  support_turnaround: number;
  trial_period: number;
  support_mycase: boolean;
}
interface IDescriptionPlanText {
  bold: string;
  normal: string;
}

interface IDescriptionPlan {
  name: string;
  childrent: IDescriptionPlanText[];
}

export interface ISubscriptionPlanCustom {
  id: string;
  name: string;
  prices: IPrice[];
  description: IDescriptionPlan[];
}

export interface ICurrentSubscription {
  current_period_end: number;
  price_plan: IPrice;
  subscription_id: string;
  subscription_plan: ISubscriptionPlan;
  trial_period_end: string;
  expired_at: string;
}

export type Plan = {
  id: string;
  name: string;
  storageLimit: number | string;
  documentSizeLimit: number | string;
  chatWithFiles: boolean;
  chatWithFolders: boolean;
  maximumMember: number | string;
  policyAnalyzerReportCard: boolean;
  discoveryToolInterrogatories: boolean;
  customerSupportEmail: boolean;
  customerSupportPhone: boolean;
  supportTurnaround: number;
  trialPeriod: number | null;
  supportMycase: boolean;
};
