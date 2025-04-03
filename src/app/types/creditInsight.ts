export enum ResourceType {
  DOCUMENT = 'document',
  QUESTION = 'question',
  STORAGE = 'storage',
}
export interface IExchangeRate {
  id: number;
  resource_type: ResourceType;
  credits: number;
  resource_quantity: number;
}

export interface IResource {
  credits: number;
  storage_limit: number;
  credit_spent: number;
  document_spent: number;
  question_spent: number;
  storage_spent: number;
}

export interface IResourceLimit {
  storage_limit: number | string;
}

export interface IExchangeResources {
  id: string;
  resource_type: string;
  resource_quantity: number;
  resource_credit: number;
  resource_spent: number;
  resource_limit: number;
  name: string;
  percentage: number;
  is_unlimited_resource: boolean;
}

export interface IResourceLeftChecking {
  isEnough: boolean;
  message?: string;
}
