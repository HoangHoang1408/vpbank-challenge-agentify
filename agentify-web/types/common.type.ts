export type Step = 'method' | 'tone' | 'test';
export type Method = 'email' | 'tone';

export interface IResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface IError {
  message: string;
  error: string;
  statusCode: number;
}
