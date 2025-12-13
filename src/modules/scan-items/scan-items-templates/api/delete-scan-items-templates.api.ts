import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DeleteScanItemsTemplatesResponse {
  status: string;
  description: string;
}

export const deleteScanItemsTemplatesApi = {
  key: "delete-scan-items-templates",
  useDeleteScanItemsTemplates: () => {
    return useMutation({
      mutationKey: [deleteScanItemsTemplatesApi.key],
      mutationFn: (params: { orgId: string; scanItemsTemplateId: string }) => {
        return api.delete<DeleteScanItemsTemplatesResponse>(
          `/api/ScanItemTemplate/org/${params.orgId}/action/DeleteScanItemTemplateById/${params.scanItemsTemplateId}`
        );
      },
      onError: useErrorToast("DeleteScanItemTemplateById"),
    });
  },
};
