import { AntdProvider, ReactQueryProvider } from '@/components/provider';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

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
      <body className="antialiased">
        <ReactQueryProvider>
          <AntdProvider>
            <div className="bg-linear-to-br from-background via-background to-primary/5">
              {children}
            </div>
          </AntdProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
