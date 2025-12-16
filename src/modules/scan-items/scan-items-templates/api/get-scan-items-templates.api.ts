import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IScanItemTemplate } from "./fetch-scan-items-templates.api";
import { AxiosError, AxiosResponse } from "axios";

export interface GetScanItemsTemplatesResponse {
  status: string;
  description: string;
  scanItemTemplate: IScanItemTemplate;
}

export const getScanItemsTemplatesApi = {
  key: "get-scan-items-templates",
  useGetScanItemsTemplates: (params: {
    orgId: string;
    scanItemTemplateId: string;
  }) => {
    return useQuery<AxiosResponse<GetScanItemsTemplatesResponse>, AxiosError>({
      queryKey: [getScanItemsTemplatesApi.key, params],
      queryFn: () => {
        return api.get(
          `/api/ScanItemTemplate/org/${params.orgId}/action/GetScanItemTemplateById/${params.scanItemTemplateId}`
        );
      },
    });
  },
};
