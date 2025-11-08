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
  pickupDate: string;  // ISO 8601
  startDate: string;   // ISO 8601
  endDate: string;     // ISO 8601
  parameters: JobParameter[];
}

export interface JobParameter {
  name: string;
  value: string;
}

export interface FetchJobRequest {
  offset: number,
  fromDate: string,
  toDate: string,
  limit: number,
  fullTextSearch: string,
  jobType: string,
}

export const fetchCronJobApi = {
  key: ["fetch-cron-job"],
  cronJob: {
    useQuery: (orgId: string, params: FetchJobRequest) => {
      return useQuery<AxiosResponse<FetchJobsResponse>, AxiosError>({
        queryKey: [...fetchCronJobApi.key, orgId, params],
        queryFn: () => {
          return api.post<FetchJobsResponse>(`/api/Job/org/${orgId}/action/GetJobs`, params);
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      })
    }
  },
  cronJobCount: {
    useQuery: (orgId: string, params: FetchJobRequest) => {
      return useQuery<AxiosResponse<number>, AxiosError>({
        queryKey: [...fetchCronJobApi.key, "count", orgId, params],
        queryFn: () => {
          return api.post<number>(`/api/Job/org/${orgId}/action/GetJobCount`, params);
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      })
    }
  }
}
