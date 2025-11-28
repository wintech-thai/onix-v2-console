import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface IRuleInputField {
  fieldName: string;
  defaultValue: string;
  fieldType: string;
}

export const getRuleInputFieldsApi = {
  key: "get-rule-evaluate-input-fields",
  useGetRuleInputFields: (
    params: {
      orgId: string;
      triggeredEvent: string;
    },
    enabled: boolean = true
  ) => {
    return useQuery<AxiosResponse<IRuleInputField[]>, AxiosError>({
      queryKey: [getRuleInputFieldsApi.key, params],
      queryFn: () => {
        return api.post(
          `/api/PointRule/org/${params.orgId}/action/GetRuleEvaluateInputFields/${params.triggeredEvent}`
        );
      },
      enabled: enabled && !!params.triggeredEvent && !!params.orgId,
    });
  },
};
