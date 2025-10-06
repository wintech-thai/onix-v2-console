import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export const unVerifyScanItemsApi = {
  deleteScanItemsKey: ["unverify-scan-items"],
  unVerifyScanItemFunc: async (orgId: string, id: string) => {
    return api.delete<void>(`/api/ScanItem/org/${orgId}/action/UnVerifyScanItemById/${id}`);
  },
  useDeleteScanItemsMutation: (orgId: string) => {
    return useMutation({
      mutationKey: [...unVerifyScanItemsApi.deleteScanItemsKey, orgId],
      mutationFn: (id: string) => unVerifyScanItemsApi.unVerifyScanItemFunc(orgId, id),
    });
  }
}
