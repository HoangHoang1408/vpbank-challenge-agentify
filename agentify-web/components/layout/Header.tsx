'use client';

import { Button, Layout, Typography } from 'antd';
import { FC, useState } from 'react';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { ToneSetting } from '../setting';

const Header: FC = () => {
  const [openToneSetting, setOpenToneSetting] = useState(false);

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
          <Button
            icon={<HiOutlineCog6Tooth />}
            color="default"
            variant="outlined"
            onClick={() => setOpenToneSetting(true)}
          >
            Tone
          </Button>
        </div>
      </div>

      <ToneSetting
        open={openToneSetting}
        onClose={() => setOpenToneSetting(false)}
      />
    </Layout.Header>
  );
};

export default Header;
