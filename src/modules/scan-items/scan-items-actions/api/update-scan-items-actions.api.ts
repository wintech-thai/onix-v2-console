import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ScanItemsActionsSchemaType } from "../schema/scan-items-actions.schema";

export const updateScanItemsActionsApi = {
  key: "update-scan-items-actions",
  useUpdateScanItemsActions: () => {
    return useMutation({
      mutationKey: [updateScanItemsActionsApi.key],
      mutationFn: (params: {
        orgId: string;
        scanItemsActionId: string;
        values: ScanItemsActionsSchemaType;
      }) => {
        return api.post(
          `/api/ScanItemAction/org/${params.orgId}/action/UpdateScanItemActionById/${params.scanItemsActionId}`,
          params.values
        );
      },
      onError: useErrorToast(),
    });
  },
};
