import {
  IError,
  IResponse,
  IRM,
  IRMCustomPrompt,
  IRMEmailSignature,
  IUpdateRMCustomPromptParams,
  IUpdateRMEmailSignatureParams,
} from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
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

export const useGetRMEmailSignatureQuery = (id: number) =>
  useQuery<IResponse<IRMEmailSignature>, AxiosError<IError>>({
    queryKey: ['rm-email-signature', id],
    queryFn: async () => {
      const response = await API.get<IResponse<IRMEmailSignature>>(
        `rms/${id}/email-signature`,
      );
      return response.data;
    },
  });

export const useUpdateRMEmailSignatureMutation = () =>
  useMutation<
    IResponse<IRMEmailSignature>,
    AxiosError<IError>,
    IUpdateRMEmailSignatureParams
  >({
    mutationFn: async ({ id, emailSignature }) => {
      const response = await API.patch<IResponse<IRMEmailSignature>>(
        `rms/${id}/email-signature`,
        {
          emailSignature,
        },
      );
      return response.data;
    },
  });

export const useGetRMCustomPromptQuery = (id: number) =>
  useQuery<IResponse<IRMCustomPrompt>, AxiosError<IError>>({
    queryKey: ['rm-custom-prompt', id],
    queryFn: async () => {
      const response = await API.get<IResponse<IRMCustomPrompt>>(
        `rms/${id}/custom-prompt`,
      );
      return response.data;
    },
  });

export const useUpdateRMCustomPromptMutation = () =>
  useMutation<
    IResponse<IRMCustomPrompt>,
    AxiosError<IError>,
    IUpdateRMCustomPromptParams
  >({
    mutationFn: async ({ id, customPrompt }) => {
      const response = await API.patch<IResponse<IRMCustomPrompt>>(
        `rms/${id}/custom-prompt`,
        {
          customPrompt,
        },
      );
      return response.data;
    },
  });
