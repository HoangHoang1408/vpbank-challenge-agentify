'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import { App, ConfigProvider, ThemeConfig } from 'antd';
import 'antd/dist/reset.css';
import type { ReactNode } from 'react';

const theme: ThemeConfig = {
  token: {
    fontSize: 16,

    colorBorder: '#dcdfe5',
    colorBorderBg: '#dcdfe5',
    colorBorderSecondary: '#dcdfe5',
  },
};

interface Props {
  children: ReactNode;
}

const AntdProvider = ({ children }: Props) => {
  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
};

export default AntdProvider;
