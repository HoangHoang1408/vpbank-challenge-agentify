'use client';

import { SEGMENT_COLORS } from '@/constants';
import { IGenEmail } from '@/types';
import { Avatar, Button, Card, Tag, Typography } from 'antd';
import { FC } from 'react';
import { LuCalendar, LuDot } from 'react-icons/lu';

interface Props {
  event: IGenEmail;
  onOpenDraftMessage: (event: IGenEmail) => void;
}

const EventCard: FC<Props> = ({ event, onOpenDraftMessage }) => {
  return (
    <Card
      className="rounded-xl! cursor-pointer hover:shadow-md transition-all duration-300"
      onClick={() => onOpenDraftMessage(event)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Avatar size={48} className="bg-[#193876]! font-medium">
            {event.customer.name
              .split(' ')
              .map((name) => name[0])
              .slice(-2)
              .join('')}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <Typography.Title level={5} className="mb-0!">
                {event.customer.name}
              </Typography.Title>
              <Tag
                color={SEGMENT_COLORS[event.customer.segment] || 'default'}
                className="rounded-xl! text-xs! font-medium"
              >
                {event.customer.segment}
              </Tag>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-2">
                <LuCalendar className="text-text-tertiary" />
                <Typography.Text type="secondary" className="text-sm!">
                  {event.emailType.split('_').join(' ').toLowerCase()}
                </Typography.Text>
              </div>
              <LuDot className="text-text-tertiary mt-1.5" />
              <div>
                <Typography.Text type="secondary" className="text-sm!">
                  Last Contact:
                </Typography.Text>
              </div>
            </div>
          </div>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDraftMessage(event);
          }}
        >
          Draft Message
        </Button>
      </div>
    </Card>
  );
};

export default EventCard;
