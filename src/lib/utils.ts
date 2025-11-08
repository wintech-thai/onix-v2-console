/* eslint-disable  @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
  type MutationKey,
  type QueryKey
} from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function errorMessageAsLangKey(message: string | undefined, t: any): string | undefined {
  if (!message) return undefined;

  return t(message as any);
}

type ErrBody = { code?: string; message?: string; details?: unknown };
export type ApiErr = AxiosError<ErrBody>;

// Response wrapper สำหรับจัดการ 403
export interface ApiResponse<T> {
  data: T | null;
  error: AxiosError | null;
  status: number | null;
  isForbidden: boolean;
}

export function useAxiosMutation<TData, TVars>(
  opts: {
    mutationKey: MutationKey;
    mutationFn: (vars: TVars) => Promise<AxiosResponse<TData>>;
  } & Omit<UseMutationOptions<AxiosResponse<TData>, ApiErr, TVars, unknown>, "mutationKey" | "mutationFn">
) {
  return useMutation<AxiosResponse<TData>, ApiErr, TVars>(opts);
}

// ✅ Query wrapper ที่จัดการ 403 และ error อื่นๆ
export function useAxiosQuery<TData>(
  opts: {
    queryKey: QueryKey;
    queryFn: () => Promise<AxiosResponse<TData>>;
  } & Omit<UseQueryOptions<ApiResponse<TData>, never>, "queryKey" | "queryFn">
) {
  return useQuery<ApiResponse<TData>, never>({
    ...opts,
    queryFn: async (): Promise<ApiResponse<TData>> => {
      try {
        const response = await opts.queryFn();
        return {
          data: response.data,
          error: null,
          status: response.status,
          isForbidden: false,
        };
      } catch (error) {
        if (error instanceof AxiosError) {
          return {
            data: null,
            error: error,
            status: error.response?.status ?? null,
            isForbidden: error.response?.status === 403,
          };
        }
        // Unknown error
        return {
          data: null,
          error: error as AxiosError,
          status: null,
          isForbidden: false,
        };
      }
    },
  });
}

export function useErrorToast(apiName: string) {
  const { t } = useTranslation();

  return (error: AxiosError) => {
    const status = error.response?.status;
    console.log({ status, apiName })

    if (status === 403) {
      toast.error(t("error.noPermissions", { apiName }));
      return;
    }

    toast.error(t("common.error"));
  };
}
