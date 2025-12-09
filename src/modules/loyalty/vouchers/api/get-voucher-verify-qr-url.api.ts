import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { IVoucher } from "./fetch-vouchers.api";
import { useErrorToast } from "@/lib/utils";

export interface GetVoucherVerifyQrUrlResponse {
  status: string;
  description: string;
  voucher: IVoucher;
}

export const getVoucherVerifyQrUrl = {
  key: "get-voucher-verify-qr-url",
  useGetVoucherVerifyQrUrl: () => {
    return useMutation({
      mutationKey: [getVoucherVerifyQrUrl.key],
      mutationFn: (params: { orgId: string; voucherId: string }) => {
        return api.get<GetVoucherVerifyQrUrlResponse>(
          `/api/Voucher/org/${params.orgId}/action/GetVoucherVerifyQrUrl/${params.voucherId}`
        );
      },
      onError: useErrorToast("GetVoucherVerifyQrUrl")
    });
  },
};
