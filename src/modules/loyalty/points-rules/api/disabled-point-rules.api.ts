import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DisablePointRuleResponse {
  status: string;
  description: string;
}

export const disabledPointRuleApi = {
  key: "disabled-point-rule",
  useDisablePointRule: () => {
    return useMutation({
      mutationKey: [disabledPointRuleApi.key],
      mutationFn: async (params: { orgId: string; pointRuleId: string }) => {
        return api.post<DisablePointRuleResponse>(
          `/api/PointRule/org/${params.orgId}/action/UpdatePointRuleStatusByIdDisable/${params.pointRuleId}`
        );
      },
      onError: useErrorToast(),
    });
  },
};
