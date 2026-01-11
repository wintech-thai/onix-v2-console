import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface UnVerifyScanItemsResponse {
  status: string;
  description: string;
}


export const unVerifyScanItemsApi = {
  deleteScanItemsKey: ["unverify-scan-items"],
  unVerifyScanItemFunc: async (orgId: string, id: string) => {
    return api.delete<UnVerifyScanItemsResponse>(`/api/ScanItem/org/${orgId}/action/UnVerifyScanItemById/${id}`);
  },
  useDeleteScanItemsMutation: (orgId: string) => {
    return useMutation({
      mutationKey: [...unVerifyScanItemsApi.deleteScanItemsKey, orgId],
      mutationFn: (id: string) => unVerifyScanItemsApi.unVerifyScanItemFunc(orgId, id),
      onError: useErrorToast(),
    });
  }
}
