import { ICustomer } from './customer.type';

export type RMLevel = 'Level 4' | 'Level 5' | 'Level 6' | 'Level 7';

export interface IRM {
  id: number;
  employeeId: number;
  name: string;
  dob: string;
  level: RMLevel;
  title: string;
  hireDate: string;
  isActive: boolean;
  customPrompt: string | null;
  customers: ICustomer[];
  createdAt: string;
  updatedAt: string;
}

export interface IRMEmailSignature {
  id: number;
  name: string;
  title: string;
  emailSignature: string | null;
}

export interface IUpdateRMEmailSignatureParams {
  id: number;
  emailSignature: string;
}

export interface IRMCustomPrompt {
  id: number;
  name?: string;
  customPrompt: string | null;
}

export interface IUpdateRMCustomPromptParams {
  id: number;
  customPrompt: string;
}
