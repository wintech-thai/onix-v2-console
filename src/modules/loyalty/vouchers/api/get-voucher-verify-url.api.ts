import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { IVoucher } from "./fetch-vouchers.api";
import { useErrorToast } from "@/lib/utils";

export interface GetVoucherVerifyUrlResponse {
  status: string;
  description: string;
  voucher: IVoucher;
}

export const getVoucherverifyurlapi = {
  key: "get-voucher-verify-url",
  useGetVoucherVerifyUrl: () => {
    return useMutation({
      mutationKey: [getVoucherverifyurlapi.key],
      mutationFn: (params: { orgId: string }) => {
        return api.get<GetVoucherVerifyUrlResponse>(
          `/api/Voucher/org/${params.orgId}/action/GetVoucherVerifyUrl`
        );
      },
      onError: useErrorToast("GetVoucherVerifyUrl")
    });
  },
};
