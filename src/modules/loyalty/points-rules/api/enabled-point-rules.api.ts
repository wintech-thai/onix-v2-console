import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface EnablePointRuleResponse {
  status: string;
  description: string;
}

export const enabledPointRuleApi = {
  key: "enabled-point-rule",
  useEnablePointRule: () => {
    return useMutation({
      mutationKey: [enabledPointRuleApi.key],
      mutationFn: async (params: { orgId: string; pointRuleId: string }) => {
        return api.post<EnablePointRuleResponse>(
          `/api/PointRule/org/${params.orgId}/action/UpdatePointRuleStatusByIdActive/${params.pointRuleId}`
        );
      },
      onError: useErrorToast(),
    });
  },
};
