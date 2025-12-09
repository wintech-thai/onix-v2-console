import { api } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { IVoucher } from "./fetch-vouchers.api";

export interface GetVoucherResponse {
  status: string;
  description: string;
  voucher: IVoucher;
}

export interface GetVoucherRequest {
  orgId: string;
  voucherId: string;
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
  useVoucherMutate: () => {
    return useMutation<
      AxiosResponse<GetVoucherResponse>,
      AxiosError,
      GetVoucherRequest
    >({
      mutationFn: (params: GetVoucherRequest) => {
        return api.get(
          `/api/Voucher/org/${params.orgId}/action/GetVoucherById/${params.voucherId}`
        );
      },
    });
  },
};
