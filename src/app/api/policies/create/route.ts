// api/policies/create

export async function POST(request: Request) {
  const requestHeaders = new Headers(request.headers);
  const authorization = requestHeaders.get('authorization');
  const formData = await request.formData();

  const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_MEDIA}/queue_text_extraction`, {
    method: 'POST',
    headers: {
      Authorization: `${authorization}`,
    },
    body: formData,
  });
  if (res.ok) {
    const data = await res.json();
    return Response.json(data);
  } else {
    return res;
  }
}
