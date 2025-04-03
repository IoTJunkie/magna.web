export interface SignInForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  confirm_password: string;
  agree_policy?: boolean;
  base_url?: string;
  register_token?: string;
  invite_token?: string;
}

export interface ForgotPwdForm {
  email: string;
  base_url?: string;
}

export interface ResetPwdForm {
  new_password_1: string;
  new_password_2: string;
}

export interface ChangePwdForm {
  old_password: string;
  new_password_1: string;
  new_password_2: string;
}

export interface UpdateProfileForm {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  mobile?: string | null;
  phone?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zip_code?: string | null;
  dial_code?: string | null;
  avatar_url?: string | null;
}

export interface ContactUsForm {
  company_name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  dial_code?: string;
  company_address: string;
  feedback_message: string;
}
export interface OtpForm {
  email: string;
  code: string;
}
