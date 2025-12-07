import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface FetchVouchersRequest {
  fromDate: string;
  toDate: string;
  offset: number;
  limit: number;
  fullTextSearch: string;
}

export interface IVoucher {
  id:               string;
  orgId:            string;
  voucherNo:        string;
  description:      string;
  customerId:       string;
  walletId:         null | string;
  privilegeId:      string;
  tags:             string;
  startDate:        null;
  endDate:          null;
  redeemPrice:      number | null;
  status:           string;
  isUsed:           string;
  voucherParams:    string;
  pin:              string;
  barcode:          null | string;
  usedDate:         null;
  createdDate:      Date;
  updatedDate:      Date;
  customerCode:     string;
  customerName:     string;
  customerEmail:    string;
  privilegeCode:    string;
  privilegeName:    string;
  voucherVerifyUrl: null;
}

export const fetchVoucherApi = {
  key: "fetch-vouchers",
  useFetchVouchers: (params: {
    orgId: string;
    params: FetchVouchersRequest;
  }) => {
    return useQuery<AxiosResponse<IVoucher[]>, AxiosError>({
      queryKey: [fetchVoucherApi.key, params.orgId, params.params],
      queryFn: () => {
        return api.post(
          `/api/Voucher/org/${params.orgId}/action/GetVouchers`,
          params.params
        );
      },
    });
  },
  useFetchVouchersCount: (params: {
    orgId: string;
    params: FetchVouchersRequest;
  }) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [fetchVoucherApi.key, "count", params.orgId, params.params],
      queryFn: () => {
        return api.post(
          `/api/Voucher/org/${params.orgId}/action/GetVoucherCount`,
          params.params
        );
      },
    });
  },
};
