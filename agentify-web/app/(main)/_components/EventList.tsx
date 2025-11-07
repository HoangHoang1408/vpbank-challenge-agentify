'use client';

import { useGetListEmail } from '@/lib/api';
import { IGenEmail } from '@/types';
import { Space, Typography } from 'antd';
import { FC, useState } from 'react';
import DraftMessage from './DraftMessage';
import EventCard from './EventCard';
import EventCardHistory from './EventCardHistory';

const EventList: FC = () => {
  const { data: emailsDraft } = useGetListEmail({
    rmId: 1,
    status: 'DRAFT',
  });

  const [historyEvents, setHistoryEvents] = useState<IGenEmail[]>([]);
  const [openDraftMessage, setOpenDraftMessage] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IGenEmail | null>(null);

  return (
    <div className="w-full max-w-5xl mx-auto">
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

      <div className="mt-8">
        <Space direction="vertical" className="w-full" size="middle">
          {emailsDraft?.data?.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onOpenDraftMessage={(event) => {
                setSelectedEvent(event);
                setOpenDraftMessage(true);
              }}
            />
          ))}
        </Space>
      </div>

      {historyEvents.length > 0 && (
        <div className="mt-6">
          <Typography.Title className="text-xl! sm:text-2xl! font-bold! mb-3! sm:mb-4!">
            History
          </Typography.Title>
          <Space direction="vertical" className="w-full" size="middle">
            {historyEvents.map((event) => (
              <EventCardHistory key={event.id} event={event} />
            ))}
          </Space>
        </div>
      )}

      <DraftMessage
        open={openDraftMessage}
        onClose={() => {
          setOpenDraftMessage(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </div>
  );
};

export default EventList;
