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
