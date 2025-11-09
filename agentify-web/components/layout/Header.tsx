'use client';

import { useGetRMByIdQuery } from '@/lib/api';
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  Layout,
  Space,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { FC, useState } from 'react';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { LuSignature } from 'react-icons/lu';
import { EmailSignatureSetting, ToneSetting } from '../setting';

const Header: FC = () => {
  const { data: rmInfo } = useGetRMByIdQuery(1);

  const [openToneSetting, setOpenToneSetting] = useState(false);
  const [openEmailSignatureSetting, setOpenEmailSignatureSetting] =
    useState(false);

  return (
    <Layout.Header className="bg-white! border-b border-border">
      <div className="container mx-auto h-full flex justify-between items-center px-2 sm:px-4 py-3 sm:py-4">
        <Typography.Title
          level={1}
          className="text-lg! sm:text-2xl! font-bold! text-primary! mb-0!"
        >
          Agentify.ai
        </Typography.Title>

        <div className="flex justify-center items-center gap-4">
          <div className="flex justify-center items-center gap-2">
            <Button
              icon={<LuSignature />}
              color="default"
              variant="outlined"
              onClick={() => setOpenEmailSignatureSetting(true)}
            >
              Email Signature
            </Button>
            <Button
              icon={<HiOutlineCog6Tooth />}
              color="default"
              variant="outlined"
              onClick={() => setOpenToneSetting(true)}
            >
              Tone
            </Button>
          </div>

          <Dropdown
            trigger={['click']}
            popupRender={() => (
              <div className="bg-white rounded-lg shadow-lg p-4 min-w-[280px] border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    size={48}
                    className="bg-[#193876]! font-medium text-base!"
                    src="/images/user-avatar.png"
                  >
                    {rmInfo?.name
                      .split(' ')
                      .map((name) => name[0])
                      .slice(-2)
                      .join('')}
                  </Avatar>
                  <div className="flex-1">
                    <Typography.Text className="font-semibold text-base! block">
                      {rmInfo?.name}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      className="text-sm! block"
                    >
                      {rmInfo?.title}
                    </Typography.Text>
                  </div>
                </div>

                <Divider className="my-3!" />

                <Space direction="vertical" size="small" className="w-full">
                  <div>
                    <Typography.Text
                      type="secondary"
                      className="text-xs! block mb-1!"
                    >
                      Employee ID
                    </Typography.Text>
                    <Typography.Text className="text-sm! block">
                      {rmInfo?.employeeId}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text
                      type="secondary"
                      className="text-xs! block mb-1!"
                    >
                      Level
                    </Typography.Text>
                    <Typography.Text className="text-sm! block">
                      {rmInfo?.level}
                    </Typography.Text>
                  </div>
                  {rmInfo?.dob && (
                    <div>
                      <Typography.Text
                        type="secondary"
                        className="text-xs! block mb-1!"
                      >
                        Date of Birth
                      </Typography.Text>
                      <Typography.Text className="text-sm! block">
                        {dayjs(rmInfo.dob).format('DD/MM/YYYY')}
                      </Typography.Text>
                    </div>
                  )}
                  {rmInfo?.hireDate && (
                    <div>
                      <Typography.Text
                        type="secondary"
                        className="text-xs! block mb-1!"
                      >
                        Hire Date
                      </Typography.Text>
                      <Typography.Text className="text-sm! block">
                        {dayjs(rmInfo.hireDate).format('DD/MM/YYYY')}
                      </Typography.Text>
                    </div>
                  )}
                </Space>
              </div>
            )}
          >
            <Avatar
              size={36}
              className="bg-[#193876]! font-medium text-sm! cursor-pointer hover:opacity-80 transition-opacity"
              src="/images/user-avatar.png"
            >
              {rmInfo?.name
                .split(' ')
                .map((name) => name[0])
                .slice(-2)
                .join('')}
            </Avatar>
          </Dropdown>
        </div>
      </div>

      <EmailSignatureSetting
        open={openEmailSignatureSetting}
        onClose={() => setOpenEmailSignatureSetting(false)}
      />
      <ToneSetting
        open={openToneSetting}
        onClose={() => setOpenToneSetting(false)}
      />
    </Layout.Header>
  );
};

export default Header;
