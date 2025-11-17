import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface EnabledUserResponse {
  status: string;
  description: string;
}

export const enabledUserApi = {
  key: "disabled-user",
  useEnabledUser: () => {
    return useMutation({
      mutationKey: [enabledUserApi.key],
      mutationFn: async (params: { orgId: string; userId: string }) => {
        return api.post<EnabledUserResponse>(
          `/api/OrganizationUser/org/${params.orgId}/action/EnableUserById/${params.userId}`
        );
      },
    });
  },
};
