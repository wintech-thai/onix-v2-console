import { useMutation } from "@tanstack/react-query";
import { UserSchemaType } from "../schema/user.schema";
import { api } from "@/lib/axios";

export interface InviteUserResponse {
  status: string;
  description: string;
}

export const inviteUserApi = {
  key: "invite-user",
  useMutation: () => {
    return useMutation({
      mutationKey: [inviteUserApi.key],
      mutationFn: (params: {
        orgId: string;
        values: UserSchemaType;
      }) => {
        return api.post<InviteUserResponse>(`/api/OrganizationUser/org/${params.orgId}/action/InviteUser`, params.values)
      }
    })
  }
}
