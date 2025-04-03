import { DEFAULT_TIMEOUT } from '@/config';

/**
 * TimeoutError Class
 *
 * This class extends the built-in Error class to represent a TimeoutError.
 * It is named 'TimeoutError' to specifically identify and handle timeout-related errors.
 *
 * Constructor Parameters:
 * @param message (string) - Optional. A custom error message describing the timeout.
 */
export class TimeoutError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Fetch with Timeout and External Abort Function
 *
 * Functionality:
 * - Performs a fetch request to a specified URL with optional configuration settings.
 * - Can be auto-aborted after a specified timeout duration.
 * - Supports external abort signals for manual aborting.
 *
 * Parameters:
 * @param input (RequestInfo) - The URL or request object pointing to the resource to fetch.
 * @param options (RequestInit) - Optional. Configuration options for the fetch request.
 * @param timeout (number) - Optional. Time in milliseconds to wait before automatically aborting the fetch.
 *
 * Returns:
 * @returns Promise<Response> - A Promise that resolves with the Response object if successful; otherwise, rejects with an error.
 *
 * Errors:
 * - TimeoutError if the request was not completed within the specified timeout.
 * - Fetch errors such as network issues, or manual aborts.
 *
 * Example Usage:
 * ```
 * fetchTimeout('https://api.example.com/data')
 *     .then(response => response.json())
 *     .then(data => console.log(data))
 *     .catch(error => {
 *         if (error instanceof TimeoutError) {
 *             console.error('The request timed out.');
 *         } else {
 *             console.error('An error occurred during the fetch:', error);
 *         }
 *     });
 * ```
 */
async function fetchTimeout(
  input: RequestInfo,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const { signal: timeoutSignal } = controller;

  const combinedSignals = new AbortController();

  if (options.signal) {
    options.signal.addEventListener('abort', () => combinedSignals.abort());
  }

  timeoutSignal.addEventListener('abort', () => combinedSignals.abort());

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const fetchPromise = fetch(input, {
    ...options,
    signal: combinedSignals.signal,
  });

  try {
    const response = await fetchPromise;
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      if (timeoutSignal.aborted) {
        throw new TimeoutError('Request timed out');
      } else {
        throw error;
      }
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default fetchTimeout;
