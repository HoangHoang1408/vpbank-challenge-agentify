import { IError, IGetTaskParams, ITask } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { API } from './axios';

export const useGetTasksQuery = (params: IGetTaskParams) =>
  useQuery<ITask[], AxiosError<IError>>({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const response = await API.get<ITask[]>('tasks', { params });
      return response.data;
    },
    refetchInterval: 5000, //
  });

export const useMarkTaskAsCompletedMutation = () =>
  useMutation<ITask, AxiosError<IError>, number>({
    mutationFn: async (taskId: number) => {
      const response = await API.delete<ITask>(`tasks/${taskId}/soft`);
      return response.data;
    },
  });

export const useMarkTaskAsInCompletedMutation = () =>
  useMutation<ITask, AxiosError<IError>, number>({
    mutationFn: async (taskId: number) => {
      const response = await API.put<ITask>(`tasks/${taskId}`, {
        status: 'IN_PROGRESS',
      });
      return response.data;
    },
  });

export const useDeleteTaskMutation = () =>
  useMutation<ITask, AxiosError<IError>, number>({
    mutationFn: async (taskId: number) => {
      const response = await API.delete<ITask>(`tasks/${taskId}`);
      return response.data;
    },
  });
