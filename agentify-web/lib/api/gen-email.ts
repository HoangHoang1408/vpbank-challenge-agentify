import {
  IGenEmail,
  IGenEmailParams,
  IRegenerateEmailParams,
  IResponse,
} from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { API } from './axios';

export const useGetListEmail = (params: IGenEmailParams) =>
  useQuery<IResponse<IGenEmail[]>, AxiosError>({
    queryKey: ['gen-email', params],
    queryFn: async () => {
      const response = await API.get<IResponse<IGenEmail[]>>('gen-email/list', {
        params,
      });
      return response.data;
    },
  });

export const useRegenerateEmailMutation = () =>
  useMutation<IResponse<IGenEmail>, AxiosError, IRegenerateEmailParams>({
    mutationFn: async ({ emailId, customPrompt }) => {
      const response = await API.post<IResponse<IGenEmail>>(
        `gen-email/regenerate/${emailId}`,
        {
          model: 'gpt-4o',
          customPrompt,
        },
      );
      return response.data;
    },
  });
