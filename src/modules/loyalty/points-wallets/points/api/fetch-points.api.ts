import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface FetchPointsRequest {
  offset: number;
  limit: number;
  fromDate: string;
  toDate: string;
  walletId: number;
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
    walletId: number;
    params: FetchPointsRequest;
  }) => {
    return useQuery({
      queryKey: [...fetchPointsApi.key],
      queryFn: () => {
        return api.post<AxiosResponse<FetchPointsResponse>, AxiosError>(
          `/api/Point/org/${params.orgId}/action/GetPointTxsByWalletId/${params.walletId}`,
          params.params
        );
      },
    });
  },
  useFetchPointsCount: (params: {
    orgId: string;
    walletId: number;
    params: FetchPointsRequest;
  }) => {
    return useQuery({
      queryKey: [...fetchPointsApi.key],
      queryFn: () => {
        return api.post<AxiosResponse<number>, AxiosError>(
          `/api/Point/org/${params.orgId}/action/GetPointTxsCountByWalletId/${params.walletId}`,
          params.params
        );
      },
    });
  },
};
