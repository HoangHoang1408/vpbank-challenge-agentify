'use client';

import { EMAIL_TYPE_COLORS, EMAIL_TYPE_LABELS } from '@/constants';
import { useGetListEmail } from '@/lib/api';
import { EmailType, IGenEmail } from '@/types';
import { Button, Space, Tag, Typography } from 'antd';
import { FC, useMemo, useState } from 'react';
import DraftMessage from './DraftMessage';
import EventCard from './EventCard';
import EventCardHistory from './EventCardHistory';

const EventList: FC = () => {
  const { data: emailsDraft, refetch: refetchEmailsDraft } = useGetListEmail({
    rmId: 1,
    status: 'DRAFT',
  });
  const { data: historyEmailEvents, refetch: refetchHistoryEmails } =
    useGetListEmail({
      rmId: 1,
      status: 'SENT_EMAIL',
    });
  const { data: historyMessageEvents, refetch: refetchHistoryMessages } =
    useGetListEmail({
      rmId: 1,
      status: 'SENT_MESSAGE',
    });

  // Merge both SENT_EMAIL and SENT_MESSAGE events
  const historyEvents = useMemo(() => {
    const emailEvents = historyEmailEvents?.data ?? [];
    const messageEvents = historyMessageEvents?.data ?? [];
    const combined = [...emailEvents, ...messageEvents];
    // Sort by updatedAt in descending order (most recent first)
    return {
      data: combined.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    };
  }, [historyEmailEvents, historyMessageEvents]);

  const refetchEmailsHistory = () => {
    refetchHistoryEmails();
    refetchHistoryMessages();
  };

  const [openDraftMessage, setOpenDraftMessage] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IGenEmail | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const MAX_HISTORY_ITEMS = 3;
  const MAX_EVENTS_PER_TYPE = 4;
  const EMAIL_TYPE_ORDER: EmailType[] = [
    'BIRTHDAY',
    'CARD_RENEWAL',
    'SEGMENT_MILESTONE',
  ];

  const groupedDraftsByType = useMemo(() => {
    const drafts = emailsDraft?.data ?? [];
    return drafts.reduce<Record<EmailType, IGenEmail[]>>(
      (acc, event) => {
        if (!acc[event.emailType]) {
          acc[event.emailType] = [];
        }
        acc[event.emailType].push(event);
        return acc;
      },
      {} as Record<EmailType, IGenEmail[]>,
    );
  }, [emailsDraft?.data]);

  const [expandedTypes, setExpandedTypes] = useState<
    Partial<Record<EmailType, boolean>>
  >({});

  const toggleTypeCollapse = (type: EmailType) => {
    setExpandedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const historyList = historyEvents?.data ?? [];
  const hasLongHistory = historyList.length > MAX_HISTORY_ITEMS;
  const visibleHistory = useMemo(() => {
    if (showAllHistory) return historyList;
    return historyList.slice(0, MAX_HISTORY_ITEMS);
  }, [historyList, showAllHistory]);

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
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

      <div className="mt-8 space-y-6">
        {EMAIL_TYPE_ORDER.map((type) => {
          const events = groupedDraftsByType[type];
          if (!events || events.length === 0) return null;

          const isExpandable = events.length > MAX_EVENTS_PER_TYPE;
          const isExpanded = expandedTypes[type] ?? false;
          const visibleEvents =
            isExpandable && !isExpanded
              ? events.slice(0, MAX_EVENTS_PER_TYPE)
              : events;

          return (
            <div
              key={type}
              className="border border-border rounded-2xl p-3 sm:p-5 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 sm:mb-5">
                <div className="flex items-center gap-3">
                  <Tag
                    color={EMAIL_TYPE_COLORS[type]}
                    className="rounded-full! text-sm! font-semibold! px-4! py-1!"
                  >
                    {EMAIL_TYPE_LABELS[type]}
                  </Tag>
                  <Typography.Text type="secondary" className="text-base!">
                    {events.length} reminder{events.length > 1 ? 's' : ''}
                  </Typography.Text>
                </div>
                {isExpandable && (
                  <Button
                    type="text"
                    size="middle"
                    onClick={() => toggleTypeCollapse(type)}
                    className="font-semibold"
                  >
                    {isExpanded ? 'Show less' : 'Show all'}
                  </Button>
                )}
              </div>
              <Space direction="vertical" className="w-full" size="large">
                {visibleEvents.map((event) => (
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
          );
        })}
      </div>

      {historyList.length > 0 && (
        <div className="mt-12">
          <div>
            <Typography.Title
              level={2}
              className="text-xl! sm:text-2xl! md:text-3xl! mb-1!"
            >
              Events Reminders History
            </Typography.Title>
            <Typography.Text
              type="secondary"
              className="text-sm! sm:text-base!"
            >
              Previously contacted clients
            </Typography.Text>
          </div>

          <div className="mt-8 border border-border rounded-2xl p-5 sm:p-7 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <Typography.Text type="secondary" className="text-base!">
                {historyList.length} event{historyList.length > 1 ? 's' : ''}
              </Typography.Text>
            </div>
            <Space direction="vertical" className="w-full" size="large">
              {visibleHistory.map((event) => (
                <EventCardHistory key={event.id} event={event} />
              ))}
            </Space>
            {hasLongHistory && (
              <div className="flex justify-center mt-5">
                <Button
                  type="text"
                  size="middle"
                  onClick={() => setShowAllHistory((prev) => !prev)}
                  className="font-semibold"
                >
                  {showAllHistory ? 'Show less' : 'Show all'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <DraftMessage
        open={openDraftMessage}
        onClose={() => {
          setOpenDraftMessage(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        refetchEmailsDraft={refetchEmailsDraft}
        refetchEmailsHistory={refetchEmailsHistory}
        updateSelectedEvent={(event) => {
          setSelectedEvent(event);
        }}
      />
    </div>
  );
};

export default EventList;
