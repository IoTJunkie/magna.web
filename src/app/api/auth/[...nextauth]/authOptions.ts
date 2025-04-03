import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

type DecodedToken = {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  first_login: boolean;
};

export const refreshAccessToken = async (refreshToken: string) => {
  console.log('refreshing access token');
  const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const token = await response.json();

  if (token.access) {
    return token.access;
  } else {
    throw new Error(token.detail);
  }
};

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/token/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const token = await response.json();

        if (token.access || token.refresh) {
          const decodedAccessToken: DecodedToken | null = jwt.decode(
            token.access as string,
          ) as DecodedToken;

          if (decodedAccessToken) {
            token.access_exp = decodedAccessToken.exp;
            token.first_login = decodedAccessToken.first_login;
          }
          return token;
        } else {
          throw new Error(token.detail);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, session }) {
      if (account && account.type === 'credentials') {
        token = { ...token, ...user };
      }
      if (session?.triggerRefreshToken) {
        // Note, that `session` can be any arbitrary object, remember to validate it!
        const newAccessToken = await refreshAccessToken(token.refresh as string);
        token.access = newAccessToken;
        const decodedAccessToken: DecodedToken | null = jwt.decode(
          token.access as string,
        ) as DecodedToken;

        // Update access token expiry
        if (decodedAccessToken) {
          token.access_exp = decodedAccessToken.exp;
        }
      }
      // Check if refresh token is expired
      if (Date.now() > Number(token.exp) * 1000) {
        console.log('refresh token expired, logging out');
        // handle logout
        redirect('/logout');
        return {};
      }

      // Check if access token is expired
      if (Date.now() > Number(token.access_exp) * 1000) {
        console.log('access token expired, refreshing');
        // refresh access token
        const newAccessToken = await refreshAccessToken(token.refresh as string);
        token.access = newAccessToken;
        const decodedAccessToken: DecodedToken | null = jwt.decode(
          token.access as string,
        ) as DecodedToken;

        // Update access token expiry
        if (decodedAccessToken) {
          token.access_exp = decodedAccessToken.exp;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.access_token = token.access;
      session.user.refresh_token = token.refresh;
      session.user.first_login = token.first_login as boolean;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
};
