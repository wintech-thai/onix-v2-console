import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useErrorToast } from "@/lib/utils";

export interface CreateScanItemTemplateJobRequest {
  name: string;
  description: string;
  tags: string;
  parameters: {
    name: string;
    value: string;
  }[];
}

export interface CreateScanItemTemplateJobResponse {
  status: string;
  description: string;
}

export const createScanItemTemplateJobApi = {
  key: ["createScanItemTemplateJob"],
  useMutation: () => {
    return useMutation({
      mutationKey: createScanItemTemplateJobApi.key,
      mutationFn: (params: {
        orgId: string;
        scanItemTemplateId: string;
        data: CreateScanItemTemplateJobRequest;
      }) => {
        return api.post<CreateScanItemTemplateJobResponse>(
          `/api/Job/org/${params.orgId}/action/CreateJobScanItemGeneratorWithTemplate/${params.scanItemTemplateId}`,
          params.data
        );
      },
      onError: useErrorToast(),
    });
  },
};
