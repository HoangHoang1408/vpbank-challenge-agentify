import { IGenEmail, IGenEmailParams, IResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
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
