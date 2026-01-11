import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { UserSchemaType } from "../schema/user.schema";
import { useErrorToast } from "@/lib/utils";

export interface UpdateUserResponse {
  status: string;
  description: string;
}

export const updateUserApi = {
  key: "update-user",
  useMutation: () => {
    return useMutation({
      mutationKey: [updateUserApi.key],
      mutationFn: (params: {
        orgId: string;
        userId: string;
        values: UserSchemaType;
      }) => {
        return api.post<UpdateUserResponse>(`/api/OrganizationUser/org/${params.orgId}/action/UpdateUserById/${params.userId}`, params.values)
      },
      onError: useErrorToast(),
    })
  }
}
