import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';

import { Providers } from '@/components/providers';

import './globals.css';

const suit = localFont({
  src: [
    { path: '../../../packages/fonts/SUIT-Thin.otf', weight: '100' },
    { path: '../../../packages/fonts/SUIT-ExtraLight.otf', weight: '200' },
    { path: '../../../packages/fonts/SUIT-Light.otf', weight: '300' },
    { path: '../../../packages/fonts/SUIT-Regular.otf', weight: '400' },
    { path: '../../../packages/fonts/SUIT-Medium.otf', weight: '500' },
    { path: '../../../packages/fonts/SUIT-SemiBold.otf', weight: '600' },
    { path: '../../../packages/fonts/SUIT-Bold.otf', weight: '700' },
    { path: '../../../packages/fonts/SUIT-ExtraBold.otf', weight: '800' },
    { path: '../../../packages/fonts/SUIT-Heavy.otf', weight: '900' },
  ],
  variable: '--font-suit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Billit',
  description: 'Billit web',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={suit.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
