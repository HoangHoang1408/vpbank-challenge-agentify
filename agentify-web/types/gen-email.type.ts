import { ICustomer, Segment } from './customer.type';

export type EmailType = 'BIRTHDAY' | 'CARD_RENEWAL' | 'SEGMENT_MILESTONE';
export type EmailStatus = 'DRAFT' | 'SENT' | 'DELETED';
type MilestoneType = 'account_anniversary' | 'segment_achievement';

export interface IGenEmailParams {
  rmId: number;
  customerId?: number;
  status?: EmailStatus;
  emailType?: EmailType;
}

export interface IGenEmailMetadata {
  segment: Segment;
  achievedDate: string;
  milestoneType: MilestoneType;
}

export interface IGenEmail {
  id: number;
  rmId: number;
  customerId: number;
  relationshipManager: null;
  customer: ICustomer;
  emailType: EmailType;
  subject: string;
  body: string;
  message: string;
  status: EmailStatus;
  metadata: IGenEmailMetadata;
  generatedAt: string;
  expiresAt: string;
  updatedAt: string;
}

export interface IRegenerateEmailParams {
  emailId: number;
  customPrompt?: string;
}
