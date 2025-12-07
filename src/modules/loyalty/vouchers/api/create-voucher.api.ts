import { useMutation } from "@tanstack/react-query";
import { VoucherSchemaType } from "../schema/vouchers.schema";
import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";

export const createVoucherApi = {
  key: "create-voucher",
  useCreateVoucher: () => {
    return useMutation({
      mutationKey: [createVoucherApi.key],
      mutationFn: (params: { orgId: string; values: VoucherSchemaType }) => {
        return api.post(
          `/api/Voucher/org/${params.orgId}/action/AddVoucher`,
          params.values
        );
      },
      onError: useErrorToast("AddVoucher"),
    });
  },
};
