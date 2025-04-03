import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './api/auth/[...nextauth]/authOptions';

export default async function Home() {
  const session = await getServerSession(authOptions);

  const isFistLogin = session?.user?.first_login;

  if (!session) {
    redirect('/signin');
  } else {
    // if (isFistLogin) {
    //   redirect('/welcome');
    // } else {
    redirect('/legal-chat');
    // }
  }
}
