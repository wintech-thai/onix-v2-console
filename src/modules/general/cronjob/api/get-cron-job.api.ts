import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { IJob } from "./fetch-cron-job.api";

export const getCronJobApi = {
  key: ["getCronJob"],
  cronJob: {
    useQuery: (orgId: string, jobId: string) => {
      return useQuery<AxiosResponse<IJob>, AxiosError>({
        queryKey: [...getCronJobApi.key, "cronJob", orgId, jobId],
        queryFn: () => {
          return api.get<IJob>(`/api/Job/org/${orgId}/action/GetJobById/${jobId}`)
        }
      });
    }
  },
  defaultCronJob: {
    useQuery: (orgId: string) => {
      return useQuery<AxiosResponse<IJob>, AxiosError>({
        queryKey: ["defaultCronJob", orgId],
        queryFn: () => {
          return api.get<IJob>(`/api/Job/org/${orgId}/action/GetJobDefault/ScanItemGenerator`)
        },
        staleTime: 0,
        gcTime: 0
      })
    }
  }
}
