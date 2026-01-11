import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DeleteScanItemsResponse {
  status: string;
  description: string;
  scanItem: null;
}

export const deleteScanItemsApi = {
  deleteScanItemsKey: ["delete-scan-items"],
  deleteScanItemsFunc: async (orgId: string, id: string) => {
    return api.delete<DeleteScanItemsResponse>(`/api/ScanItem/org/${orgId}/action/DeleteScanItemById/${id}`);
  },
  useDeleteScanItemsMutation: (orgId: string) => {
    return useMutation({
      mutationKey: [...deleteScanItemsApi.deleteScanItemsKey, orgId],
      mutationFn: (id: string) => deleteScanItemsApi.deleteScanItemsFunc(orgId, id),
      onError: useErrorToast(),
    });
  }
}
