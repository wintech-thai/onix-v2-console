import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { IPointRule } from "./fetch-point-rules.api";

export interface GetPointRulesResponse {
  status: string;
  description: string;
  pointRule: IPointRule
}

export const getPointRulesApi = {
  key: "get-point-rule",
  useGetPointRule: (params: { orgId: string; pointRuleId: string }) => {
    return useQuery<AxiosResponse<GetPointRulesResponse>, AxiosError>({
      queryKey: [getPointRulesApi.key, params],
      queryFn: async () => {
        return api.get(
          `/api/PointRule/org/${params.orgId}/action/GetPointRuleById/${params.pointRuleId}`
        );
      },
    });
  },
};
