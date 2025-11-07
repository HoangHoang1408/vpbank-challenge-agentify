'use client';

import { MainLayout } from '@/components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FC, ReactNode } from 'react';

dayjs.extend(relativeTime);

interface Props {
  children: ReactNode;
}

const MainAppLayout: FC<Props> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default MainAppLayout;
