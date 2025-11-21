import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse, AxiosError } from "axios";
import { IWallets } from "./fetch-wallets.api";

export const getWalletsApi = {
  key: "get-wallets",
  useGetWallets: (params: { orgId: string; walletId: number }) => {
    return useQuery<AxiosResponse<IWallets>, AxiosError>({
      queryKey: [getWalletsApi.key],
      queryFn: () => {
        return api.get(
          `/api/Point/org/${params.orgId}/action/GetWalletById/${params.walletId}`
        );
      },
    });
  },
};
