import { CacheModes } from '@/config';

// 🛠 Configuration for the fetch request
export interface FetchRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // and other HTTP methods
  headers?: Record<string, string>;
  body?: BodyInit | null;
  signal?: AbortSignal;
  timeout?: number;
  cache?: RequestCache; // 🗄 Caching strategy
}

// 🗂 Default cache strategy
const DEFAULT_CACHE_MODE: CacheModes = CacheModes.DEFAULT;

// 🚀 Function to create fetch options with given token and cache strategy
export default function createFetchOptions(
  accessToken?: string,
  cacheMode: RequestCache = DEFAULT_CACHE_MODE,
): FetchRequestConfig {
  // Ensure cacheMode is a valid RequestCache value
  const isValidCacheMode = Object.values(CacheModes).includes(cacheMode as CacheModes);
  const finalCacheMode = isValidCacheMode ? cacheMode : DEFAULT_CACHE_MODE;

  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || ''}`, // 🔑 Include the accessToken if available
    },
    cache: finalCacheMode, // 🗄 Set the cache strategy
  };
}
