'use client';

import { Button, Layout, Typography } from 'antd';
import { FC } from 'react';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { LuPlug2 } from 'react-icons/lu';

const Header: FC = () => {
  return (
    <Layout.Header className="bg-white! border-b border-border">
      <div className="container mx-auto h-full flex justify-between items-center px-2 sm:px-4 py-3 sm:py-4">
        <Typography.Title
          level={1}
          className="text-lg! sm:text-2xl! font-bold! text-primary! mb-0!"
        >
          Agentify.ai
        </Typography.Title>

        <div className="flex justify-center items-center gap-2">
          <Button icon={<LuPlug2 />} color="default" variant="outlined">
            Integrations
          </Button>
          <Button
            icon={<HiOutlineCog6Tooth />}
            color="default"
            variant="outlined"
          >
            Tone
          </Button>
        </div>
      </div>
    </Layout.Header>
  );
};

export default Header;
