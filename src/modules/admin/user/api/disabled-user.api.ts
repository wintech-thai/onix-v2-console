import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DisabledUserResponse {
  status: string;
  description: string;
}

export const disabledUserApi = {
  key: "disabled-user",
  useDisabledUser: () => {
    return useMutation({
      mutationKey: [disabledUserApi.key],
      mutationFn: async (params: { orgId: string; userId: string }) => {
        return api.post<DisabledUserResponse>(
          `/api/OrganizationUser/org/${params.orgId}/action/DisableUserById/${params.userId}`
        );
      },
      onError: useErrorToast(),
    });
  },
};
