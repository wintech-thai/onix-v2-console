/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface TestPointRulesResponse {
  status: string;
  description: string;
  isMatch: boolean;
  ruleMatch: string;
  executionResult: string;
  messages: string[];
}

export const testPointRulesApi = {
  key: "test-point-rules",
  useTestPointRules: () => {
    return useMutation({
      mutationKey: [testPointRulesApi.key],
      mutationFn: async (params: {
        orgId: string;
        values: Record<string, any>;
      }) => {
        return api.post<TestPointRulesResponse>(
          `/api/PointRule/org/${params.orgId}/action/TestPointRule`,
          params.values
        );
      },
    });
  },
};
