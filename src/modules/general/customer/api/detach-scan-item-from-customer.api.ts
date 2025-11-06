import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useErrorToast } from "@/lib/utils";

export interface DetacheScanItemToCustomerResponse {
  status: string;
  description: string;
}

export const detachScanItemToCustomerApi = {
  key: "detach-scan-item-to-customer",
  useMutation: () => {
    return useMutation({
      mutationKey: [detachScanItemToCustomerApi.key],
      mutationFn: (params: { orgId: string; scanItemId: string }) => {
        return api.post<DetacheScanItemToCustomerResponse>(
          `/api/ScanItem/org/${params.orgId}/action/DetachScanItemFromCustomer/${params.scanItemId}`
        );
      },
      onError: useErrorToast("DetachScanItemFromCustomer"),
    });
  },
};
