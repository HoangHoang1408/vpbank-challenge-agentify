import { IError, IResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { API } from './axios';

export const useGetAllCustomer = (params: unknown) =>
  useQuery<IResponse, AxiosError<IError>>({
    queryKey: ['customer', params],
    queryFn: async () => {
      const response = await API.get<IResponse>('customers', { params });
      return response.data;
    },
  });
