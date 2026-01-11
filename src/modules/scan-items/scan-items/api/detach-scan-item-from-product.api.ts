import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DetachScanItemFromProductResponse {
  status: string;
  description: string;
  scanItem: null;
}

export const detachScanItemFromProductApi = {
  key: "detach-scan-item-from-product",
  useDetachScanItemFromProduct: () => {
    return useMutation({
      mutationKey: [detachScanItemFromProductApi.key],
      mutationFn: (params: {
        orgId: string;
        scanItemId: string;
      }) => {
        return api.post<DetachScanItemFromProductResponse>(`/api/ScanItem/org/${params.orgId}/action/DetachScanItemFromProduct/${params.scanItemId}`)
      },
      onError: useErrorToast()
    })
  }
}
