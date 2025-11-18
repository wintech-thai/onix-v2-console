import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface StatsResponse {
  id: string;
  orgId: string;
  statCode: string;
  balanceDate: string;
  balanceDateKey: string;
  txIn: string;
  txOut: string;
  balanceBegin: number;
  balanceEnd: number;
  createdDate: string;
}

export interface LimitResponse {
  id: string;
  orgId: string;
  statCode: string;
  limit: number;
  createdDate: string;
}

export const dashboardStatsApi = {
  GetCurrentBalanceStats: {
    key: "get-current-balance-stats",
    useGetCurrentBalanceStats: (params: { orgId: string }) => {
      return useQuery<AxiosResponse<StatsResponse[]>, AxiosError>({
        queryKey: [dashboardStatsApi.GetCurrentBalanceStats.key, params],
        queryFn: () => {
          return api.get(
            `/api/Stat/org/${params.orgId}/action/GetCurrentBalanceStats`
          );
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      });
    },
  },
  GetStats: {
    key: "get-stats",
    useGetStats: (params: {
      orgId: string;
      statCode: string;
      fromDate: string;
      toDate: string;
      limit: number;
      offset: number;
    }) => {
      return useQuery<AxiosResponse<StatsResponse[]>, AxiosError>({
        queryKey: [dashboardStatsApi.GetStats.key, params],
        queryFn: () => {
          return api.post(
            `/api/Stat/org/${params.orgId}/action/GetStats`,
            params
          );
        },
      });
    },
  },
  GetLimits: {
    key: "get-limits",
    useGetLimits: (params: { orgId: string }) => {
      return useQuery<AxiosResponse<LimitResponse[]>, AxiosError>({
        queryKey: [dashboardStatsApi.GetLimits.key, params],
        queryFn: () => {
          return api.get(
            `/api/Limit/org/${params.orgId}/action/GetLimits`
          );
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      });
    },
  },
};
