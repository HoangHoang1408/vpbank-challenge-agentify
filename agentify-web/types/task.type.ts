import { ICustomer } from './customer.type';
import { IRM } from './rm.type';

export type TaskStatus = 'IN_PROGRESS' | 'COMPLETED';
export type TaskType =
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'FOLLOW_UP'
  | 'SEND_INFO_PACKAGE';

export interface ITask {
  id: number;
  taskId: string;
  rmId: number;
  relationshipManager: IRM;
  customerId: number;
  customer: ICustomer;
  taskType: TaskType;
  status: TaskStatus;
  taskDetails: string;
  createdAt: string;
  dueDate: string;
  updatedAt: string;
}

export interface IGetTaskParams {
  rmId?: number;
  customerId?: number;
  status?: TaskStatus;
  taskType?: TaskType;
}
