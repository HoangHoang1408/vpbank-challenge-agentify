'use client';

import { SEGMENT_COLORS } from '@/constants';
import { IGenEmail } from '@/types';
import { Avatar, Button, Card, Tag, Typography } from 'antd';
import { FC } from 'react';

interface Props {
  event: IGenEmail;
  onOpenDraftMessage: (event: IGenEmail) => void;
}

const EventCard: FC<Props> = ({ event, onOpenDraftMessage }) => {
  return (
    <Card
      className="rounded-xl! cursor-pointer hover:shadow-md transition-all duration-300"
      onClick={() => onOpenDraftMessage(event)}
      size="small"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Avatar size={40} className="bg-[#193876]! font-medium text-sm!">
            {event.customer.name
              .split(' ')
              .map((name) => name[0])
              .slice(-2)
              .join('')}
          </Avatar>
          <div>
            <div className="flex items-center gap-1 flex-wrap">
              <Typography.Title level={5} className="mb-0! text-base!">
                {event.customer.name}
              </Typography.Title>
              <Tag
                color={SEGMENT_COLORS[event.customer.segment] || 'default'}
                className="rounded-xl! text-xs! font-medium"
              >
                {event.customer.segment}
              </Tag>
            </div>
          </div>
        </div>
        <Button
          type="primary"
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
