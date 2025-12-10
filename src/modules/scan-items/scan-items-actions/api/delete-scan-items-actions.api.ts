import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DeleteScanItemsActionsResponse {
  status: string;
  description: string;
}

export const deleteScanItemsActionsApi = {
  key: "delete-scan-items-actions",
  useDeleteScanItemsActions: () => {
    return useMutation({
      mutationKey: [deleteScanItemsActionsApi.key],
      mutationFn: (params: { orgId: string; scanItemsActionId: string }) => {
        return api.delete<DeleteScanItemsActionsResponse>(
          `/api/ScanItemAction/org/${params.orgId}/action/DeleteScanItemActionById/${params.scanItemsActionId}`
        );
      },
      onError: useErrorToast("DeleteScanItemActionById"),
    });
  },
};
