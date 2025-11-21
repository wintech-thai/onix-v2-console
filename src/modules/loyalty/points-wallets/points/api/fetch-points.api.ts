import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface FetchPointsRequest {
  offset: number;
  limit: number;
  fromDate: string;
  toDate: string;
  walletId: string;
}

export interface IPoints {
  id: string;
  orgId: string;
  walletId: string;
  tags: string;
  description: string;
  txAmount: number;
  txType: number;
  currentBalance: number;
  previousBalance: number;
  createdDate: string;
  updatedDate: string;
}

export type FetchPointsResponse = IPoints[];

export const fetchPointsApi = {
  key: "fetch-points",
  useFetchPoints: (params: {
    orgId: string;
    walletId: string;
    params: FetchPointsRequest;
  }) => {
    return useQuery<AxiosResponse<FetchPointsResponse>, AxiosError>({
      queryKey: [...fetchPointsApi.key, params],
      queryFn: () => {
        return api.post(
          `/api/Point/org/${params.orgId}/action/GetPointTxsByWalletId/${params.walletId}`,
          params.params
        );
      },
    });
  },
  useFetchPointsCount: (params: {
    orgId: string;
    walletId: string;
    params: FetchPointsRequest;
  }) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [...fetchPointsApi.key, "count", params],
      queryFn: () => {
        return api.post(
          `/api/Point/org/${params.orgId}/action/GetPointTxsCountByWalletId/${params.walletId}`,
          params.params
        );
      },
    });
  },
};
