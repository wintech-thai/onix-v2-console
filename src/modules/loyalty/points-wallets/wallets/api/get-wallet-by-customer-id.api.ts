import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { IWallets } from "./fetch-wallets.api";

export interface GetWalletByCustomerIdResponse {
  status: string;
  description: string;
  wallet: IWallets;
}

export const getWalletByCustomerIdApi = {
  key: "get-wallet-by-customer-id",
  useGetWalletByCustomerId: () => {
    return useMutation({
      mutationKey: [getWalletByCustomerIdApi.key],
      mutationFn: (params: { orgId: string; customerId: string }) => {
        return api.get<GetWalletByCustomerIdResponse>(
          `/api/Point/org/${params.orgId}/action/GetWalletByCustomerId/${params.customerId}`
        );
      },
      onError: useErrorToast("GetWalletByCustomerId"),
    });
  },
};
