import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface SetDefaultScanItemsActionsResponse {
  status: string;
  description: string;
}

export const setDefaultScanItemsActionsApi = {
  key: "set-default-scan-items-actions",
  useSetDefaultScanItemsActions: () => {
    return useMutation({
      mutationKey: [setDefaultScanItemsActionsApi.key],
      mutationFn: (params: { orgId: string; scanItemsActionId: string }) => {
        return api.post<SetDefaultScanItemsActionsResponse>(
          `/api/ScanItemAction/org/${params.orgId}/action/SetDefaultScanItemActionById/${params.scanItemsActionId}`
        );
      },
      onError: useErrorToast("SetDefaultScanItemActionById"),
    });
  },
};
