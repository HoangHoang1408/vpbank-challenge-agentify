'use client';

import { IEvent } from '@/types';
import { Avatar, Button, Card, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';
import { LuCalendar, LuDot } from 'react-icons/lu';

interface Props {
  event: IEvent;
}

const EventCard: FC<Props> = ({ event }) => {
  return (
    <Card className="rounded-xl! cursor-pointer hover:shadow-md transition-all duration-300">
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
  );
};

export default EventCard;
