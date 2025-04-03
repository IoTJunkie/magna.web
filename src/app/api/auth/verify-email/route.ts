// http://localhost:3000/api/auth/verify-email

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uidb64 = searchParams.get('uidb64');
  const token = searchParams.get('token');
  if (uidb64 && token) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/verify-email/${uidb64}/${token}/confirm/`,
    );
    const res = await response.json();
    return Response.json(res);
  }

  return Response.json({ errors: ['Invalid token.'] });
}
