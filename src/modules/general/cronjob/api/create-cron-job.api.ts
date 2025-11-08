import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useErrorToast } from "@/lib/utils";

export interface CreateCronJobRequest {
  name: string;
  description: string;
  tags: string;
  parameters: {
    name: string;
    value: string;
  }[];
}

export interface CreateCronJobResponse {
  status: string;
  description: string;
}

export const createCronJobApi = {
  key: ["createCronJob"],
  useMutation: () => {
    return useMutation({
      mutationKey: createCronJobApi.key,
      mutationFn: (params: {
        orgId: string;
        data: CreateCronJobRequest;
      }) => {
        return api.post<CreateCronJobResponse>(`/api/Job/org/${params.orgId}/action/CreateJobScanItemGenerator`, params.data)
      },
      onError: useErrorToast("CreateJobScanItemGenerator"),
    })
  }
}
