'use client';

import { IEvent } from '@/types';
import { Space, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import DraftMessage from './DraftMessage';
import EventCard from './EventCard';
import EventCardHistory from './EventCardHistory';

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
    contactedTime: '2025-11-07T01:26:55.000Z',
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
  const [events, setEvents] = useState<IEvent[]>(mockData);
  const [historyEvents, setHistoryEvents] = useState<IEvent[]>([]);
  const [openDraftMessage, setOpenDraftMessage] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  useEffect(() => {
    setEvents(mockData.filter((event) => !event.contacted));
    setHistoryEvents(mockData.filter((event) => event.contacted));
  }, []);

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
          {events.map((event) => (
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
