import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export type FetchJobsResponse = IJob[];

export interface IJob {
  id: string;
  orgId: string;
  status: string;
  jobMessage: string;
  name: string;
  tags: string;
  description: string;
  type: string;
  progressPct: number;
  succeedCount: number;
  failedCount: number;
  configuration: string;
  createdDate: string; // ISO 8601
  updatedDate: string; // ISO 8601
  pickupDate: string; // ISO 8601
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  parameters: JobParameter[];
}

export interface JobParameter {
  name: string;
  value: string;
}

export interface FetchJobRequest {
  offset: number;
  fromDate: string;
  toDate: string;
  limit: number;
  fullTextSearch: string;
  jobType: string;
  scanItemTemplateId: string;
}

export const fetchCronJobApi = {
  key: ["fetch-cron-job"],
  useFetchScanItemTemplateJob: {
    useQuery: (params: {
      orgId: string;
      scanItemTemplateId: string;
      params: FetchJobRequest;
    }) => {
      return useQuery<AxiosResponse<FetchJobsResponse>, AxiosError>({
        queryKey: [...fetchCronJobApi.key, params],
        queryFn: () => {
          return api.post<FetchJobsResponse>(
            `/api/Job/org/{id}/action/GetScanItemJobsByTemplateId/${params.scanItemTemplateId}`,
            params
          );
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      });
    },
  },
  useFetchScanItemTemplateJobCount: {
    useQuery: (params: {
      orgId: string;
      scanItemTemplateId: string;
      params: FetchJobRequest;
    }) => {
      return useQuery<AxiosResponse<number>, AxiosError>({
        queryKey: [...fetchCronJobApi.key, params],
        queryFn: () => {
          return api.post<number>(
            `/api/Job/org/{id}/action/GetScanItemJobCountByTemplateId/${params.scanItemTemplateId}`,
            params
          );
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      });
    },
  },
};
