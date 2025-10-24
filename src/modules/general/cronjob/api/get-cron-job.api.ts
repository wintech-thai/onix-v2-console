import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IJob } from "./fetch-cron-job.api";

export const getCronJobApi = {
  key: ["getCronJob"],
  cronJob: {
    useQuery: (orgId: string, jobId: string) => {
      return useQuery({
        queryKey: [...getCronJobApi.key, "cronJob", orgId, jobId],
        queryFn: () => {
          return api.get<IJob>(`/api/Job/org/${orgId}/action/GetJobById/${jobId}`)
        }
      });
    }
  },
  defaultCronJob: {
    useQuery: (orgId: string, key: string) => {
      return useQuery({
        queryKey: ["defaultCronJob", orgId, key],
        queryFn: () => {
          return api.get<IJob>(`/api/Job/org/${orgId}/action/GetJobDefault/ScanItemGenerator`)
        }
      })
    }
  }
}
