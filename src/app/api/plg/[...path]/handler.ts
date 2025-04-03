import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import fetchTimeout, { TimeoutError } from '@/app/utils/fetchTimeout';
import makeApiUrl from '@/app/utils/makeApiUrl';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

function prepareFetchOptions(request: NextRequest, accessToken: string, body: string) {
  const headers = new Headers();

  // Adding authorization token
  headers.append('Authorization', `Bearer ${accessToken}`);

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.append('Content-Type', contentType);
  }

  // Packing fetch options
  const fetchOptions: RequestInit = {
    method: request.method || 'GET', // 🛑 Default method is GET
    headers,
  };

  // Adding body if method is not GET or HEAD and request has body
  if (request.method !== 'GET' && request.method !== 'HEAD' && body) {
    fetchOptions.body = body;
  }

  return fetchOptions;
}

const commonHandler = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  // If no session found, return Unauthorized
  if (!session || !session.user.access_token) {
    return new Response(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }

  const accessToken = session?.user?.access_token as string;

  const path = request.nextUrl.pathname;
  // remove prefix /api/plg/
  const pathSegments = path.split('/').slice(3);

  const searchParams = request.nextUrl.searchParams;

  // add '/' to last path segment is current endpoints rule
  const url = makeApiUrl(process.env.NEXT_PUBLIC_ENDPOINT_URL, ...pathSegments, '/', searchParams);
  const body = await request.clone().text();
  const fetchOptions = prepareFetchOptions(request, accessToken, body);

  // Fetching data
  try {
    // console.log('REQUEST____', url, fetchOptions);
    // Forwards the request to the API
    const response = await fetchTimeout(url, fetchOptions);

    // If successful, return the data
    if (response.ok && response.body && response.status !== 204) {
      const responseData = await response.json();
      return new Response(JSON.stringify(responseData), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } else if (
      response.ok &&
      !response.body &&
      response.status === 204 &&
      fetchOptions.method === 'DELETE'
    ) {
      return new Response(null, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } else {
      // Handle errors
      const errorData = await response.json();
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
  } catch (error: unknown) {
    // Handle fetch errors
    if (error instanceof TimeoutError) {
      console.error('Timeout fetching data:', error.message);
      return new Response(null, {
        status: 504,
        statusText: 'Timeout fetching data',
      });
    }

    // Handle other errors
    if (error instanceof Error) {
      console.error('Error fetching data:', error.message);
      return new Response(null, {
        status: 500,
        statusText: 'Error fetching data: ' + error.message,
      });
    }

    console.error('Unknown error fetching data:', error);
    return new Response(null, {
      status: 500,
      statusText: 'Unknown error fetching data',
    });
  }
};

export default commonHandler;
