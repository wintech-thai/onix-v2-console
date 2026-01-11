import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DeleteVoucherResponse {
  status: string;
  description: string;
}

export const deleteVoucherApi = {
  key: "delete-voucher",
  useDeleteVoucher: () => {
    return useMutation({
      mutationKey: [deleteVoucherApi.key],
      mutationFn: (params: { orgId: string; voucherId: string }) => {
        return api.delete<DeleteVoucherResponse>(
          `/api/Voucher/org/${params.orgId}/action/DeleteVoucherById/${params.voucherId}`
        );
      },
      onError: useErrorToast(),
    });
  },
};
