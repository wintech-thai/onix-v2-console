import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DeletePointRuleResponse {
  status: string;
  description: string;
}

export const deletePointRuleApi = {
  key: "delete-point-rule",
  useDeletePointRule: () => {
    return useMutation({
      mutationKey: [deletePointRuleApi.key],
      mutationFn: async (params: { orgId: string; pointRuleId: string }) => {
        return api.delete<DeletePointRuleResponse>(
          `/api/PointRule/org/${params.orgId}/action/DeletePointRuleById/${params.pointRuleId}`
        );
      },
      onError: useErrorToast()
    });
  },
};
