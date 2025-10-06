import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export const deleteScanItemsApi = {
  deleteScanItemsKey: ["delete-scan-items"],
  deleteScanItemsFunc: async (orgId: string, id: string) => {
    return api.delete<void>(`/api/ScanItem/org/${orgId}/action/DeleteScanItemById/${id}`);
  },
  useDeleteScanItemsMutation: (orgId: string) => {
    return useMutation({
      mutationKey: [...deleteScanItemsApi.deleteScanItemsKey, orgId],
      mutationFn: (id: string) => deleteScanItemsApi.deleteScanItemsFunc(orgId, id),
    });
  }
}
