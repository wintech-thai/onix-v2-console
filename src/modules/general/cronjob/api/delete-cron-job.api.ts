import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query"

export interface DeleteCronJobResponse {
  status: string;
  description: string;
}

export const deleteCronJobApi = {
  key: "delete-cron-job",
  useMuatation: () => {
    return useMutation({
      mutationKey: [deleteCronJobApi.key],
      mutationFn: (params: {
        orgId: string;
        jobId: string;
      }) => {
        return api.delete<DeleteCronJobResponse>(`/api/Job/org/${params.orgId}/action/DeleteJobById/${params.jobId}`)
      }
    })
  }
}
