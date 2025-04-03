import path from 'path';

/**
 * Constructs a complete API URL by combining the base API URL and additional path segments or query parameters.
 * @param baseApiUrl - The base API URL.
 * @param pathSegments - Additional path segments or query parameters to be appended to the URL.
 * @returns The complete API URL.
 * @throws {Error} If the base API URL is invalid or if there is an error constructing the URL.
 */
export default function makeApiUrl(
  baseApiUrl: string | undefined,
  ...pathSegments: (string | URLSearchParams)[]
): string {
  if (!baseApiUrl) {
    throw new Error('Invalid base URL!');
  }

  try {
    const url = new URL(baseApiUrl);

    pathSegments.forEach((segment) => {
      if (typeof segment === 'string') {
        url.pathname = path.join(url.pathname, segment);
      } else if (typeof segment === 'object') {
        segment.forEach((value, key) => {
          url.searchParams.append(key, value.toString());
        });
      }
    });

    return url.toString();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to construct URL: ${error.message}`);
    }
    throw new Error('Failed to construct URL - an unknown error occurred!');
  }
}
