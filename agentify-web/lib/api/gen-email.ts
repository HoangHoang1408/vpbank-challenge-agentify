import {
  IError,
  IGenEmail,
  IGenEmailParams,
  IRegenerateEmailParams,
  IResponse,
  IUpdateEmailStatusParams,
} from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { API } from './axios';

export const useGetListEmail = (params: IGenEmailParams) =>
  useQuery<IResponse<IGenEmail[]>, AxiosError<IError>>({
    queryKey: ['gen-email', params],
    queryFn: async () => {
      const response = await API.get<IResponse<IGenEmail[]>>('gen-email/list', {
        params,
      });
      return response.data;
    },
  });

export const useRegenerateEmailMutation = () =>
  useMutation<IResponse<IGenEmail>, AxiosError<IError>, IRegenerateEmailParams>(
    {
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
    },
  );

export const useUpdateEmailStatusMutation = () =>
  useMutation<
    IResponse<IGenEmail>,
    AxiosError<IError>,
    IUpdateEmailStatusParams
  >({
    mutationFn: async ({ emailId, status = 'SENT' }) => {
      const response = await API.patch<IResponse<IGenEmail>>(
        `gen-email/${emailId}/status`,
        {
          status,
        },
      );
      return response.data;
    },
  });
