'use client';

import { IEvent } from '@/types';
import { Card, Space, Typography } from 'antd';
import { FC } from 'react';
import { LuStar } from 'react-icons/lu';
import EventCard from './EventCard';

const mockData: IEvent[] = [
  {
    id: 1,
    customerName: 'Margaret Chen',
    customerRank: 'diamond',
    eventName: 'Birthday Today',
    lastContact: '2025-10-24',
    contacted: false,
  },
  {
    id: 2,
    customerName: 'David Thompson',
    customerRank: 'platinum',
    eventName: 'Loan Renewal - 7 Days',
    lastContact: '2025-11-04',
    contacted: true,
  },
  {
    id: 3,
    customerName: 'Acme Corporation',
    customerRank: 'diamond',
    eventName: 'Quarterly Review Due',
    lastContact: '2025-10-06',
    contacted: false,
  },
  {
    id: 4,
    customerName: 'Sarah Williams',
    customerRank: 'gold',
    eventName: 'No Contact - 45 Days',
    lastContact: '2025-09-22',
    contacted: false,
  },
];

const EventList: FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex justify-between">
        <div>
          <Typography.Title
            level={2}
            className="text-xl! sm:text-2xl! md:text-3xl! mb-1!"
          >
            Special Events Reminders
          </Typography.Title>
          <Typography.Text type="secondary" className="text-sm! sm:text-base!">
            Prioritized clients needing your attention
          </Typography.Text>
        </div>

        <div className="flex items-center">
          <Card
            size="small"
            className="rounded-xl! [&_.ant-card-body]:px-4! [&_.ant-card-body]:py-2!"
          >
            <div className="flex justify-center items-center gap-2">
              <LuStar className="text-[#f6a823]" />
              <Typography.Paragraph className="mb-0! font-medium">
                4 clients
              </Typography.Paragraph>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Space direction="vertical" className="w-full" size="middle">
          {mockData
            .filter((event) => !event.contacted)
            .map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
        </Space>
      </div>
    </div>
  );
};

export default EventList;
