import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface FetchPointTriggerRequeset {
  offset: number;
  limit: number;
  fromDate: string;
  toDate: string;
  fullTextSearch: string;
}

export interface IPointTrigger {
  id: string;
  orgId: string;
  walletId: string;
  triggerName: string;
  description: string;
  tags: string | null;
  triggeredEvent: string;
  triggerDate: string;
  points: number;
  isRuleMatch: string;
  triggerParams: string;
  createdDate: string;
  updatedDate: string | null;
}

export const fetchPointTriggerApi = {
  key: "fetch-point-trigger",
  useFetchPointTrigger: (params: {
    orgId: string;
    values: FetchPointTriggerRequeset;
  }) => {
    return useQuery<AxiosResponse<IPointTrigger[]>, AxiosError>({
      queryKey: [fetchPointTriggerApi.key, params],
      queryFn: () => {
        return api.post(
          `/api/PointTrigger/org/${params.orgId}/action/GetPointTriggers`,
          params.values
        );
      },
    });
  },
  useFetchPointTriggerCount: (params: {
    orgId: string;
    values: FetchPointTriggerRequeset;
  }) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [fetchPointTriggerApi.key, "count", params],
      queryFn: () => {
        return api.post(
          `/api/PointTrigger/org/${params.orgId}/action/GetPointTriggersCount`,
          params.values
        );
      },
    });
  },
  useFetchPointTriggerById: (params: { orgId: string; id: string }) => {
    return useQuery<AxiosResponse<IPointTrigger>, AxiosError>({
      queryKey: [fetchPointTriggerApi.key, params],
      queryFn: () => {
        return api.post(
          `/api/PointTrigger/org/${params.orgId}/action/GetPointTriggerById`,
          { id: params.id }
        );
      },
      enabled: !!params.id,
    });
  },
};
