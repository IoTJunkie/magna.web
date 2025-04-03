export const DEFAULT_TIMEOUT = 120000; // 60 seconds

export const LEGAL_HISTORY_QUERY_KEY = 'LEGAL-HISTORIES-QUERY-KEY';
export const POLICY_HISTORY_QUERY_KEY = 'POLICY-HISTORIES-QUERY-KEY';
export const CHAT_SESSION_HISTORY_KEY = 'CHAT-SESSION-HISTORY-KEY';
export const MAGNA_AI_BOOKMARK_QUERY_KEY = 'MAGNA-AI-BOOKMARK-QUERY-KEY';
export const POLICY_BOOKMARK_QUERY_KEY = 'POLICY-BOOKMARK-QUERY-KEY';
export const CHAT_SESSION_BOOKMARK_QUERY_KEY = 'CHAT-SESSION-BOOKMARK-QUERY-KEY';
export const INTERROGATIVE_LIST_QUESTION_KEY = 'INTERROGATIVE-LIST-QUESTION';

export const SETTING_SUBSCRIPTION_PLAN = 'SETTING-SUBSCRIPTION-PLAN';
export const SETTING_ACCOUNT_PROFILE = 'SETTING-ACCOUNT-PROFILE';
export const USER_PROFILE = 'USER-PROFILE';
export const ACCOUNT_RESOURCE = 'ACCOUNT_RESOURCE';
export const RESOURCE_PROFILE = 'RESOURCE-PROFILE';
export const THEME_SETTING = 'THEME-SETTING';
export const AUTH_ENPOINT_BOX = 'https://account.box.com/api/oauth2/authorize';
export const AUTH_TOKEN_ENPOINT_BOX = 'https://api.box.com/oauth2/token/';
export const ENPOINT_API_BOX = 'https://api.box.com/2.0';
export const ENPOINT_API_Drive = 'https://www.googleapis.com/drive/v3/files';
export const AUTH_ENPOINT_MY_CASE = 'https://auth.mycasekegging.com/login_sessions/new';
// export const AUTH_ENPOINT_MY_CASE = 'https://auth.mycase.com/login_sessions/new';
export const AUTH_TOKEN_ENPOINT_MY_CASE = 'https://auth.mycasekegging.com/tokens';
// export const AUTH_TOKEN_ENPOINT_MY_CASE = 'https://auth.mycase.com/tokens';

export const IMAGE_TYPE_ALLOWED = ['image/png', 'image/jpeg', 'image/jpg'];

export const FILE_TYPE_ALLOWED_SHOW_PAGE = ['pdf', 'PDF'];

export const PlansName = {
  Plus: 'Plus',
  Premium: 'Premium',
  Policy_Pro: 'Policy Pro',
  Esquire: 'Esquire',
};

export const TimeFormat = {
  full: 'MM/DD/YYYY HH:mm:ss',
  ymd: 'YYYY/MM/DD',
  dmy: 'DD/MM/YYYY',
  mdy: 'MM/DD/YYYY',
};

export const intMax = 2147483647;

export enum StatustrialPeriodEnd {
  ENDED = 'ended',
  DURING_TRIAL = 'during_trial',
  DURING_TRIAL_LESS_24 = 'during_trial_less_24',
  UPGRADED = 'upgraded',
}

export const STORAGE_ITEM_NAME = {
  users_have_used_policy_pro: 'users_have_used_policy_pro',
  subs_redirect: 'subs_redirect',
  first_time_login: 'first_time_login',
  tour_guide_finished: 'tour_guide_finished',
};
