import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DisabledVoucherResponse {
  status: string;
  description: string;
}

export const disabledVoucherApi = {
  key: "disabled-voucher-api",
  useDisabledVoucher: () => {
    return useMutation({
      mutationKey: [disabledVoucherApi.key],
      mutationFn: (params: {
        orgId: string;
        voucherId: string;
      }) => {
        return api.post<DisabledVoucherResponse>(`/api/Voucher/org/${params.orgId}/action/DisableVoucherById/${params.voucherId}`)
      },
      onError: useErrorToast("DisableVoucherById")
    })
  },
}
