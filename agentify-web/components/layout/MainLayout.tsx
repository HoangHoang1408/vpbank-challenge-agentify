'use client';

import { Layout } from 'antd';
import { FC, ReactNode } from 'react';
import { AgentChat } from '../agent';
import Header from './Header';

interface Props {
  children: ReactNode;
}

const MainLayout: FC<Props> = ({ children }) => {
  return (
    <Layout className="h-dvh! overflow-hidden">
      <Layout>
        <Header />
        <Layout.Content className="bg-linear-to-br from-background via-background to-primary/5 flex-1! overflow-y-auto">
          {children}
        </Layout.Content>
      </Layout>
      <AgentChat />
    </Layout>
  );
};

export default MainLayout;
