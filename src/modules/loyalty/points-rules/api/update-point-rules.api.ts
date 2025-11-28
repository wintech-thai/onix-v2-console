import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface UpdatePointRuleResponse {
  status: string;
  description: string;
}

export interface UpdatePointRuleRequest {
  ruleName: string;
  ruleDefinition: string;
  description: string;
  tags: string;
  triggeredEvent: string;
  priority: number;
  startDate: string | null;
  endDate: string | null;
}

export const updatePointRuleApi = {
  key: "update-point-rule",
  useUpdatePointRule: () => {
    return useMutation({
      mutationKey: [updatePointRuleApi.key],
      mutationFn: async (params: {
        orgId: string;
        pointRuleId: string;
        values: UpdatePointRuleRequest;
      }) => {
        return api.post<UpdatePointRuleResponse>(
          `/api/PointRule/org/${params.orgId}/action/UpdatePointRuleById/${params.pointRuleId}`,
          params.values
        );
      },
      onError: useErrorToast("UpdatePointRuleById"),
    });
  },
};
