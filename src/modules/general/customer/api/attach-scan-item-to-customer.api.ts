import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useErrorToast } from "@/lib/utils";

export interface AttacheScanItemToCustomerResponse {
  status: string;
  description: string;
}

export const attachScanItemToCustomerApi = {
  key: "attach-scan-item-to-customer",
  useMutation: () => {
    return useMutation({
      mutationKey: [attachScanItemToCustomerApi.key],
      mutationFn: (params: {
        orgId: string;
        scanItemId: string;
        customerId: string;
      }) => {
        return api.post<AttacheScanItemToCustomerResponse>(`/api/ScanItem/org/${params.orgId}/action/AttachScanItemToCustomer/${params.scanItemId}/${params.customerId}`)
      },
      onError: useErrorToast("AttachScanItemToCustomer"),
    })
  }
}
