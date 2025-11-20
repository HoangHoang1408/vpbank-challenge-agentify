import { EmailType } from '@/types';

export const EMAIL_TYPE_COLORS: Record<EmailType, string> = {
  BIRTHDAY: '#8B5CF6', // vibrant purple
  CARD_RENEWAL: '#3B82F6', // professional blue
  SEGMENT_MILESTONE: '#F59E0B', // warm amber
};

export const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  BIRTHDAY: 'Birthday',
  CARD_RENEWAL: 'Card Renewal',
  SEGMENT_MILESTONE: 'Segment Milestone',
};

