import { IGetTaskParams, ITask } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { API } from './axios';

export const useGetTasksQuery = (params: IGetTaskParams) =>
  useQuery<ITask[], AxiosError>({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const response = await API.get<ITask[]>('tasks', { params });
      return response.data;
    },
  });
