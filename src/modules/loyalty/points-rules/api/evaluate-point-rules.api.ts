/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface EvaluatePointRulesResponse {
  status: string;
  description: string;
  isMatch: boolean;
  ruleMatch: string;
  executionResult: string;
  messages: string[];
}

export const evaluatePointRulesApi = {
  key: "evaluate-point-rules",
  useEvaluatePointRules: () => {
    return useMutation({
      mutationKey: [evaluatePointRulesApi.key],
      mutationFn: (params: {
        orgId: string;
        triggeredEvent: string;
        values: Record<string, any>;
      }) => {
        return api.post(
          `/api/PointRule/org/${params.orgId}/action/EvaluatePointRules/${params.triggeredEvent}`,
          params.values
        );
      },
      onError: useErrorToast(),
    });
  },
};
