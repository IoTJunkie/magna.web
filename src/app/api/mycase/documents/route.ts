export async function GET(request: Request) {
  const requestHeaders = new Headers(request.headers);
  const caseId = requestHeaders.get('param');
  const authorization = requestHeaders.get('authorization');

  const rs = await fetch(
    `https://external-integrations.mycasekegging.com/v1/cases/${caseId}/documents`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${authorization}`,
      },
    },
  );
  const data = await rs.json();
  return Response.json(data);
}
