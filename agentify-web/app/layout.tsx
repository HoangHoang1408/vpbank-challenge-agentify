import { AntdProvider, ReactQueryProvider } from '@/components';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agentify',
  description: 'Agentify is a platform for supporting your business',
};

interface Props {
  children: ReactNode;
}

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="en">
      <body className="antialiased">
        <ReactQueryProvider>
          <AntdProvider>{children}</AntdProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
