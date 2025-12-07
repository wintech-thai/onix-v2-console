import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export const setVoucherUnusedByIdApi = {
  key: "set-voucher-unused-by-id",
  useSetVoucherUnusedById: () => {
    return useMutation({
      mutationKey: [setVoucherUnusedByIdApi.key],
      mutationFn: (params: { orgId: string; voucherId: string }) => {
        return api.post(
          `/api/Voucher/org/${params.orgId}/action/SetVoucherUnusedById/${params.voucherId}`
        );
      },
      onError: useErrorToast("SetVoucherUnusedById")
    });
  },
};
