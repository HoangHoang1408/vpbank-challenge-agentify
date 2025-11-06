'use client';

import { Method } from '@/types';
import { Card, Space, Typography } from 'antd';
import type { FC } from 'react';
import { LuMail, LuMessageSquare } from 'react-icons/lu';

const { Title, Paragraph } = Typography;

interface Props {
  handleMethodSelect: (method: Method) => void;
}

const ChooseMethod: FC<Props> = ({ handleMethodSelect }) => {
  return (
    <div>
      <Title level={4} className="text-xl mb-4!">
        Step 1: Choose Setup Method
      </Title>

      <Space direction="vertical" className="gap-4! w-full">
        <Card
          className="border-2! hover:border-primary! transition-[border-color] duration-300 cursor-pointer"
          onClick={() => handleMethodSelect('email')}
        >
          <div className="flex gap-4">
            <LuMail className="w-8 h-8" />
            <div>
              <Title level={4} className="mb-1!">
                Connect Email
              </Title>
              <Paragraph type="secondary" className="mb-0!">
                Let the AI learn your communication style from your sent emails
              </Paragraph>
            </div>
          </div>
        </Card>

        <Card
          className="border-2! hover:border-primary! transition-[border-color] duration-300 cursor-pointer"
          onClick={() => handleMethodSelect('tone')}
        >
          <div className="flex gap-4">
            <LuMessageSquare className="w-8 h-8 text-primary" />
            <div>
              <Title level={4} className="mb-1!">
                Choose Communication Tone
              </Title>
              <Paragraph type="secondary" className="mb-0!">
                Select from preset tones or describe your own style
              </Paragraph>
            </div>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default ChooseMethod;
