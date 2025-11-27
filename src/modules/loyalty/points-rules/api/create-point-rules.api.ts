import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface CreatePointRuleResponse {
  status: string;
  description: string;
}

export interface CreatePointRuleRequest {
  ruleName: string;
  ruleDefinition: string;
  description: string;
  tags: string;
  triggeredEvent: string;
  priority: number;
  startDate: string | null;
  endDate: string | null;
}

export const createPointRulesApi = {
  key: "create-point-rules",
  useCreatePointRule: () => {
    return useMutation({
      mutationKey: [createPointRulesApi.key],
      mutationFn: async (params: {
        orgId: string;
        values: CreatePointRuleRequest;
      }) => {
        return api.post<CreatePointRuleResponse>(
          `/api/PointRule/org/${params.orgId}/action/AddPointRule`,
          params.values
        );
      },
      onError: useErrorToast("AddPointRule"),
    });
  },
};
