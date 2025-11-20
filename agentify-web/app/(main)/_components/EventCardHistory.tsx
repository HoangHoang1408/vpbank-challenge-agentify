'use client';

import { IGenEmail } from '@/types';
import { Card, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';

interface Props {
  event: IGenEmail;
}

const EventCardHistory: FC<Props> = ({ event }) => {
  const communicationType = event.status === 'SENT_EMAIL' ? 'Email' : 'Message';
  const actionText = event.status === 'SENT_EMAIL' ? 'Sent email' : 'Sent message';

  return (
    <Card className="rounded-xl! hover:shadow-md transition-all duration-300 py-2!">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Typography.Text className="font-semibold text-sm! sm:text-base!">
            {event.customer.name}
          </Typography.Text>
          <Tag className="text-xs! font-semibold rounded-xl!">{communicationType}</Tag>
          <Typography.Text type="secondary" className="text-xs! sm:text-sm!">
            • {actionText}
          </Typography.Text>
        </div>
        <div>
          <Typography.Text type="secondary" className="text-xs! sm:text-sm!">
            {dayjs(event.updatedAt).format('DD/MM/YYYY HH:mm:ss A')}
          </Typography.Text>
        </div>
      </div>
    </Card>
  );
};

export default EventCardHistory;
