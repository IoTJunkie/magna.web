export enum MemberShipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REJECTED = 'reject',
}

export type Item = {
  id: string;
  name: string;
  email: string;
  status: MemberShipStatus;
  action: JSX.Element;
};

export type IMember = {
  name: string;
  email: string;
  app_user: string;
  avatar_url: string;
  status: MemberShipStatus;
  id: string;
};
