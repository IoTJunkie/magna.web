export async function GET(request: Request) {
  const requestHeaders = new Headers(request.headers);
  const authorization = requestHeaders.get('authorization');
  const param = requestHeaders.get('param');
  const response: any = await fetch(
    `https://external-integrations.mycasekegging.com/v1/documents/${param}/data`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${authorization}`,
      },
    },
  );
  if (response.status === 200) {
    return response;
  } else {
    const errorData = await response.json();
    return new Response(errorData);
  }
}
