'use client';

import { IGenEmail } from '@/types';
import { Card, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';

interface Props {
  event: IGenEmail;
}

const EventCardHistory: FC<Props> = ({ event }) => {
  return (
    <Card className="rounded-xl! hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Typography.Text className="font-semibold text-sm! sm:text-base!">
              {event.customer.name}
            </Typography.Text>
            <Tag className="text-xs! font-semibold rounded-xl!">Message</Tag>
          </div>
          <Typography.Text type="secondary" className="text-sm!">
            Marked as contacted
          </Typography.Text>
        </div>
        <div>
          <Typography.Text type="secondary" className="text-sm! sm:text-xs!">
            {dayjs(event.updatedAt).format('DD/MM/YYYY HH:mm:ss A')}
          </Typography.Text>
        </div>
      </div>
    </Card>
  );
};

export default EventCardHistory;
