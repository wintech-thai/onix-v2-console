import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosResponse, AxiosError } from "axios";
import { IScanItemsAction } from "./fetch-scan-items-actions.api";
import { useErrorToast } from "@/lib/utils";

export const getScanItemActionsDefaultApi = {
  key: "get-default-scan-items-actions",
  useGetDefaultScanItemActions: () => {
    return useMutation<AxiosResponse<IScanItemsAction>, AxiosError, { orgId: string }>({
      mutationKey: [getScanItemActionsDefaultApi.key],
      mutationFn: (params: { orgId: string }) => {
        return api.get(
          `/api/ScanItemAction/org/${params.orgId}/action/GetScanItemActionDefault`
        );
      },
      onError: useErrorToast("GetScanItemActionDefault"),
    });
  },
};
