import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface IScanItemsAction {
  id: string;
  orgId: string;
  actionName: string;
  description: string;
  redirectUrl: string;
  encryptionKey: string;
  encryptionIV: string;
  themeVerify: string;
  registeredAwareFlag: string;
  tags: string;
  isDefault: string;
  createdDate: string;
}

export interface FetchScanItemsActionsRequest {
  offset: number;
  fromDate: string;
  toDate: string;
  limit: number;
  fullTextSearch: string;
}

export const fetchScanItemsActionsApi = {
  key: ["fetch-scan-items-actions"],
  useFetchScanItemsActions: (params: {
    orgId: string;
    params: FetchScanItemsActionsRequest;
  }) => {
    return useQuery<AxiosResponse<IScanItemsAction[]>, AxiosError>({
      queryKey: [...fetchScanItemsActionsApi.key, params],
      queryFn: () => {
        return api.post(
          `/api/ScanItemAction/org/${params.orgId}/action/GetScanItemActions`,
          params.params
        );
      },
    });
  },
  useFetchScanItemsActionsCount: (params: {
    orgId: string;
    params: FetchScanItemsActionsRequest;
  }) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [...fetchScanItemsActionsApi.key, "count", params],
      queryFn: () => {
        return api.post(
          `/api/ScanItemAction/org/${params.orgId}/action/GetScanItemActionCount`,
          params.params
        );
      },
    });
  },
};
