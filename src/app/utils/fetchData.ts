import { DEFAULT_TIMEOUT } from '@/config';
import fetchTimeout from './fetchTimeout';

/**
 * 🌐📡 fetchData - Async function to fetch data from a given URL with type safety and timeout support. 🦺🔒⏳
 *
 * This function sends an HTTP 📨 request to the specified URL and returns the
 * response as a JSON object of the specified type. It incorporates a timeout
 * mechanism that aborts the request if it doesn't complete within the specified
 * timeout period. It throws an error if the network response is not okay
 * (i.e., the response status is not in the range 200-299) or if the request times out. 🚦
 *
 * @template T 🎨 - The expected return type of the response JSON.
 *
 * @param {RequestInfo} input 🎯 - The URL to fetch or a Request object.
 * @param {RequestInit} [init] ⚙️ - Optional. Configuration options for the fetch request,
 * such as method, headers, body, etc.
 * @param {number} [timeout] ⏱ - Optional. The maximum duration (milliseconds) to wait
 * for the fetch to complete. Default is a predefined constant value.
 *
 * @returns {Promise<T>} 🎁 - A Promise that resolves to the response JSON as the specified type.
 *
 * @throws 🚨 - Will throw an error if the network response is not okay or if the request times out.
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * fetchData<User>('https://api.example.com/users/1')
 *   .then(user => console.log(user.name)) // Output: user's name
 *   .catch(error => console.error(error)); // Handle error 🚑
 * ```
 *
 * @async 🚀
 */

export class FetchDataError extends Error {
  response: Response;

  constructor(response: Response) {
    super(response.statusText);
    this.response = response;
    this.name = 'FetchDataError';
    Object.setPrototypeOf(this, FetchDataError.prototype);
  }
}

export default async function fetchData<T>(
  input: RequestInfo,
  init?: RequestInit,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<T> {
  const response = await fetchTimeout(input, init, timeout);
  if (!response.ok) {
    throw new FetchDataError(response);
  }
  const data = await response.json();
  return data as T;
}
