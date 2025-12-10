import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { ScanItemsActionsSchemaType } from "../schema/scan-items-actions.schema";
import { useErrorToast } from "@/lib/utils";

export const createScanItemsActionsApi = {
  key: "create-scan-items-actions",
  useCreateScanItemsActions: () => {
    return useMutation({
      mutationKey: [createScanItemsActionsApi.key],
      mutationFn: (params: {
        orgId: string;
        values: ScanItemsActionsSchemaType;
      }) => {
        return api.post(
          `/api/ScanItemAction/org/${params.orgId}/action/AddScanItemAction`,
          params.values
        );
      },
      onError: useErrorToast("AddScanItemAction")
    });
  },
};
