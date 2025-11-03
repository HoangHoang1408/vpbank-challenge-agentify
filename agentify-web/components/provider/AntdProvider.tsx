'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import { App, ConfigProvider, ThemeConfig } from 'antd';
import 'antd/dist/reset.css';
import type { ReactNode } from 'react';

const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    fontFamily: 'var(--font-montserrat)',

    colorBorder: '#e4e4e7',
    colorBorderBg: '#e4e4e7',
    colorBorderSecondary: '#e4e4e7',
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
