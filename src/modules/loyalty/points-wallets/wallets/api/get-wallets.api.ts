import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse, AxiosError } from "axios";
import { IWallets } from "./fetch-wallets.api";

export interface GetWalletsResponse {
  status: string;
  description: string;
  wallet: IWallets;
}

export const getWalletsApi = {
  key: "get-wallets",
  useGetWallets: (
    params: { orgId: string; walletId: string },
    options?: { enabled?: boolean }
  ) => {
    return useQuery<AxiosResponse<GetWalletsResponse>, AxiosError>({
      queryKey: [getWalletsApi.key, params.walletId],
      queryFn: () => {
        return api.get(
          `/api/Point/org/${params.orgId}/action/GetWalletById/${params.walletId}`
        );
      },
      ...options,
    });
  },
};
