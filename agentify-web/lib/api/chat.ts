import { IChatRequest, IChatResponse, IError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

// Create a separate axios instance for chat API
const ChatAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL_CHAT || 'http://18.136.71.18:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useSendChatMessageMutation = () =>
  useMutation<IChatResponse, AxiosError<IError>, IChatRequest>({
    mutationFn: async (data: IChatRequest) => {
      const response = await ChatAPI.post<IChatResponse>('/chat', data);
      return response.data;
    },
  });

export const useClearChatHistoryMutation = () =>
  useMutation<void, AxiosError<IError>, number>({
    mutationFn: async (rm_id: number) => {
      await ChatAPI.delete(`/chat/history/${rm_id}`);
    },
  });

