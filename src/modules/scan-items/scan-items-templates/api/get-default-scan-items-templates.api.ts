import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { IJob } from "@/modules/general/cronjob/api/fetch-cron-job.api";

export interface GetDefaultScanItemsTemplatesResponse {
  status: string;
  description: string;
  job: IJob;
}

export const getDefaultScanItemsTemplatesApi = {
  key: "get-default-scan-items-templates",
  useGetDefaultScanItemsTemplates: (params: {
    orgId: string;
    scanItemTemplateId: string;
  }) => {
    return useQuery<
      AxiosResponse<GetDefaultScanItemsTemplatesResponse>,
      AxiosError
    >({
      queryKey: [getDefaultScanItemsTemplatesApi.key, params],
      queryFn: () => {
        return api.get(
          `/api/ScanItemTemplate/org/${params.orgId}/action/GetJobDefaultByTemplateId/${params.scanItemTemplateId}`
        );
      },
      staleTime: 0,
      gcTime: 0
    });
  },
};
