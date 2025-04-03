// http://localhost:3000/api/auth/forgot-pwd

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/reset-password/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data);
}
