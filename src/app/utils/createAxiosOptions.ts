import { DEFAULT_TIMEOUT } from '@/config/constants';
import { type AxiosRequestConfig } from 'axios';

// Extend AxiosRequestConfig
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  accessToken?: string;
}

const baseOptions: Omit<AxiosRequestConfig, 'headers'> = {
  timeout: DEFAULT_TIMEOUT,
};

// Function to generate common axios options
export default function createAxiosOptions(
  options: ExtendedAxiosRequestConfig = {},
): AxiosRequestConfig {
  const { accessToken, ...otherOptions } = options;

  // Creating headers object with a relaxed type definition
  const headers: { [key: string]: string } = {
    ...(otherOptions.headers as { [key: string]: string }),
  };

  // Conditionally adding authorization header if accessToken exists
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return {
    ...baseOptions,
    ...otherOptions,
    headers,
  };
}
