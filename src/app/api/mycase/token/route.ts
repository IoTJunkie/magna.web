import { AUTH_TOKEN_ENPOINT_MY_CASE } from '@/config';

export async function POST(request: Request) {
  const body = await request.json();

  const rs = await fetch(AUTH_TOKEN_ENPOINT_MY_CASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: 'auth.mycasekegging.com',
      Accept: '*/*',
    },
    body: new URLSearchParams(JSON.parse(body.headers.body)),
  });
  const data = await rs.json();
  return Response.json(data);
}
