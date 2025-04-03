import NextAuth from 'next-auth/next';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      role?: string | null;
      access_token?: string | unknown;
      refresh_token?: string | unknown;
      first_login?: boolean;
    };
  }
}
