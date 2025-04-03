import ThemeProvider from '@/app/providers/fluent-provider';
import { ReactQueryProvider } from '@/app/providers/query-client-provider';
import SpinnerProvider from '@/contexts/SpinnerContext';
import type { Metadata } from 'next';
import { Inter, Work_Sans } from 'next/font/google';
import './globals.scss';
import NextAuthProvider from './providers/next-auth-provider';
import { CustomThemeProvider } from '@/contexts/ThemeContext';
import { TourProvider } from '@/contexts/TourContext'; // Import TourProvider

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MAGNA',
  description: 'MAGNA Chatbot',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${inter.variable} ${workSans.variable} min-h-screen w-full font-sans antialiased`}
      >
        <NextAuthProvider>
          <ReactQueryProvider>
            <CustomThemeProvider>
              <ThemeProvider>
                <TourProvider>
                  <SpinnerProvider>{children}</SpinnerProvider>
                </TourProvider>
              </ThemeProvider>
            </CustomThemeProvider>
          </ReactQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
