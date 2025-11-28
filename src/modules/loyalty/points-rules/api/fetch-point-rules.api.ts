import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface FetchPointRuleRequest {
  offset: number;
  limit: number;
  fromDate: string;
  toDate: string;
  fullTextSearch: string;
}

export interface IPointRule {
  id: string;
  orgId: string;
  ruleName: string;
  ruleDefinition: string;
  description: string;
  tags: string;
  triggeredEvent: string;
  status: string;
  pointsReturn: number;
  priority: number;
  startDate: string;
  endDate: string;
  createdDate: string;
  updatedDate: string;
}

export const fetchPointRuleApi = {
  key: "fetch-point-rule",
  useFetchPointRules: (params: {
    orgId: string;
    values: FetchPointRuleRequest;
  }) => {
    return useQuery<AxiosResponse<IPointRule[]>, AxiosError>({
      queryKey: [fetchPointRuleApi.key, params],
      queryFn: async () => {
        return api.post(
          `/api/PointRule/org/${params.orgId}/action/GetPointRules`,
          params.values
        );
      },
    });
  },
  useFetchPointRulesCount: (params: {
    orgId: string;
    values: FetchPointRuleRequest;
  }) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [fetchPointRuleApi.key, "count", params],
      queryFn: async () => {
        return api.post(
          `/api/PointRule/org/${params.orgId}/action/GetPointRulesCount`,
          params.values,
        );
      },
    });
  },
};
