import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface AttachScanItemToProductResponse {
  status: string;
  description: string;
}

export const AttachScanItemToProductApi = {
  key: "AttachScanItemToProductApi",
  useMutation: () => {
    return useMutation({
      mutationKey: [AttachScanItemToProductApi.key],
      mutationFn: (params: {
        orgId: string;
        scanItemId: string;
        productId: string;
      }) => {
        return api.post<AttachScanItemToProductResponse>(`/api/ScanItem/org/${params.orgId}/action/AttachScanItemToProduct/${params.scanItemId}/${params.productId}`)
      }
    })
  }
}
