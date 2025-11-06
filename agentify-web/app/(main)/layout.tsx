'use client';

import { MainLayout } from '@/components';
import { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const MainAppLayout: FC<Props> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default MainAppLayout;
