import { IError, IRM } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { API } from './axios';

export const useGetRMByIdQuery = (id: number) =>
  useQuery<IRM, AxiosError<IError>>({
    queryKey: ['rm', id],
    queryFn: async () => {
      const response = await API.get<IRM>(`rms/${id}`);
      return response.data;
    },
  });
