import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { IPointRule } from "./fetch-point-rules.api";

export const getPointRulesApi = {
  key: "get-point-rule",
  useGetPointRule: (params: { orgId: string; pointRuleId: string }) => {
    return useQuery<AxiosResponse<IPointRule>, AxiosError>({
      queryKey: [getPointRulesApi.key, params],
      queryFn: async () => {
        return api.get(
          `/api/PointRule/org/${params.orgId}/action/GetPointRuleById/${params.pointRuleId}`
        );
      },
    });
  },
};
