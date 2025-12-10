import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { IScanItemsAction } from "./fetch-scan-items-actions.api";

export interface GetScanItemActionsResponse {
  status: string;
  description: string;
  scanItemAction: IScanItemsAction;
}

export const getScanItemActionsApi = {
  key: "get-scan-items-actions",
  useGetScanItemActions: (params: { orgId: string; scanItemsActionId: string }) => {
    return useQuery<AxiosResponse<GetScanItemActionsResponse>, AxiosError>({
      queryKey: [getScanItemActionsApi.key, params],
      queryFn: () => {
        return api.get(
          `/api/ScanItemAction/org/${params.orgId}/action/GetScanItemActionById/${params.scanItemsActionId}`
        );
      },
      // This query does not require a refetch on window focus or network reconnect
      refetchOnWindowFocus: false,
    })
  }
}
