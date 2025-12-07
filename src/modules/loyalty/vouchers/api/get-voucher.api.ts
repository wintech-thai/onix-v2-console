import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { IVoucher } from "./fetch-vouchers.api";

export interface GetVoucherResponse {
  status: string;
  description: string;
  voucher: IVoucher;
}


export const getVoucherApi = {
  key: "get-voucher",
  useGetVoucher: (params: { orgId: string; voucherId: string }) => {
    return useQuery<AxiosResponse<GetVoucherResponse>, AxiosError>({
      queryKey: [getVoucherApi.key, params.orgId, params.voucherId],
      queryFn: () => {
        return api.get(
          `/api/Voucher/org/${params.orgId}/action/GetVoucherById/${params.voucherId}`
        );
      },
    });
  },
};
