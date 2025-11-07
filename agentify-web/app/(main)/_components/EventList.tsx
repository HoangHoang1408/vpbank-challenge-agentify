'use client';

import { Avatar, Button, Card, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FC } from 'react';
import { LuCalendar, LuDot, LuStar } from 'react-icons/lu';

dayjs.extend(relativeTime);

interface IEvent {
  id: number;
  customerName: string;
  customerRank: 'gold' | 'diamond' | 'platinum';
  eventName: string;
  lastContact: string;
  contacted: boolean;
}

const mockData: IEvent[] = [
  {
    id: 1,
    customerName: 'Margaret Chen',
    customerRank: 'diamond',
    eventName: 'Birthday Today',
    lastContact: '2025-10-24',
    contacted: true,
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
    contacted: true,
  },
  {
    id: 4,
    customerName: 'Sarah Williams',
    customerRank: 'gold',
    eventName: 'No Contact - 45 Days',
    lastContact: '2025-09-22',
    contacted: true,
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
          {mockData.map((event) => (
            <Card
              key={event.id}
              className="rounded-xl! cursor-pointer hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Avatar size={48} className="bg-[#193876]! font-medium">
                    {event.customerName.split(' ').map((name) => name[0])}
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <Typography.Title level={5} className="mb-0!">
                        {event.customerName}
                      </Typography.Title>
                      <Tag
                        color={
                          event.customerRank === 'gold'
                            ? 'gold'
                            : event.customerRank === 'diamond'
                              ? 'cyan'
                              : 'purple'
                        }
                        className="rounded-xl! text-xs! font-medium"
                      >
                        {event.customerRank}
                      </Tag>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-2">
                        <LuCalendar className="text-text-tertiary" />
                        <Typography.Text type="secondary" className="text-sm!">
                          {event.eventName}
                        </Typography.Text>
                      </div>
                      <LuDot className="text-text-tertiary mt-1.5" />
                      <div>
                        <Typography.Text type="secondary" className="text-sm!">
                          Last Contact: {dayjs(event.lastContact).fromNow()}
                        </Typography.Text>
                      </div>
                    </div>
                  </div>
                </div>
                <Button type="primary" size="large">
                  Draft Message
                </Button>
              </div>
            </Card>
          ))}
        </Space>
      </div>
    </div>
  );
};

export default EventList;
