import { IGetTaskParams, ITask } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
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

export const useMarkTaskAsCompletedMutation = () =>
  useMutation<ITask, AxiosError, number>({
    mutationFn: async (taskId: number) => {
      const response = await API.delete<ITask>(`tasks/${taskId}/soft`);
      return response.data;
    },
  });
