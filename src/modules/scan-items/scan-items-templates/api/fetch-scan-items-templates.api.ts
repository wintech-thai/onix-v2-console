import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface FetchScanItemsTemplatesRequest {
  limit: number;
  offset: number;
  fromDate: string;
  toDate: string;
  fullTextSearch: string;
}
export interface IScanItemTemplate {
  id: string;
  orgId: string;
  templateName: string;
  description: string;
  serialPrefixDigit: number;
  generatorCount: number;
  serialDigit: number;
  pinDigit: number;
  urlTemplate: string;
  notificationEmail: string;
  tags: string;
  isDefault: string;
  createdDate: string;
}

export const fetchScanItemsTemplatesApi = {
  key: "fetch-scan-items-templates",
  useFetchScanItemsTemplates: (params: {
    orgId: string;
    params: FetchScanItemsTemplatesRequest;
  }) => {
    return useQuery<AxiosResponse<IScanItemTemplate[]>, AxiosError>({
      queryKey: [fetchScanItemsTemplatesApi.key, params],
      queryFn: () => {
        return api.post(
          `/api/ScanItemTemplate/org/${params.orgId}/action/GetScanItemTemplates`,
          params.params
        );
      },
    });
  },
  useFetchScanItemsTemplatesCount: (params: {
    orgId: string;
    params: FetchScanItemsTemplatesRequest;
  }) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [fetchScanItemsTemplatesApi.key, "count", params],
      queryFn: () => {
        return api.post(
          `/api/ScanItemTemplate/org/${params.orgId}/action/GetScanItemTemplateCount`,
          params.params
        );
      },
    });
  },
};
