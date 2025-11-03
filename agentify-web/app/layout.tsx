import { AntdProvider, ReactQueryProvider } from '@/components/provider';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const MontserratFont = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Agentify',
  description: 'Agentify is a platform for creating and managing AI agents',
};

interface Props {
  children: ReactNode;
}

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="en">
      <body className={cn(MontserratFont.variable, 'antialiased')}>
        <ReactQueryProvider>
          <AntdProvider>{children}</AntdProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
