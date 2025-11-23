import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface FetchWalletsRequest {
  offset: number;
  fromDate: string;
  toDate: string;
  limit: number;
  fullTextSearch: string;
}

export interface IWallets {
  id: string;
  orgId: string;
  name: string;
  tags: string;
  description: string;
  customerId: string;
  pointBalance: number;
  createdDate: string;
  updatedDate: string;
}

export type FetchWalletsResponse = IWallets[];

export const fetchWalletsApi = {
  key: "fetch-wallets",
  useFetchWallets: (params: { orgId: string; params: FetchWalletsRequest }) => {
    return useQuery<AxiosResponse<FetchWalletsResponse>, AxiosError>({
      queryKey: [fetchWalletsApi.key, params.orgId, params.params],
      queryFn: () => {
        return api.post(
          `/api/Point/org/${params.orgId}/action/GetWallets`,
          params.params
        );
      },
    });
  },
  useFetchWalletsCount: (params: {
    orgId: string;
    params: FetchWalletsRequest;
  }) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [fetchWalletsApi.key, "count", params.orgId, params.params],
      queryFn: () => {
        return api.post(
          `/api/Point/org/${params.orgId}/action/GetWalletsCount`,
          params.params
        );
      },
    });
  },
};
