import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface EnabledVoucherResponse {
  status: string;
  description: string;
}

export const enabledVoucherApi = {
  key: "enabled-voucher-api",
  useEnabledVoucher: () => {
    return useMutation({
      mutationKey: [enabledVoucherApi.key],
      mutationFn: (params: { orgId: string; voucherId: string }) => {
        return api.post<EnabledVoucherResponse>(
          `/api/Voucher/org/${params.orgId}/action/EnableVoucherById/${params.voucherId}`
        );
      },
      onError: useErrorToast("EnableVoucherById"),
    });
  },
};
