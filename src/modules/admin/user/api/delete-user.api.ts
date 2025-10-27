import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export const deleteUserApi = {
  key: "deleteUser",
  useDeleteUser: () => {
    return useMutation({
      mutationKey: [deleteUserApi.key],
      mutationFn: (params: { orgId: string; userId: string }) => {
        return api.delete(`/api/OrganizationUser/org/${params.orgId}/action/DeleteUserById/${params.userId}`);
      }
    })
  }
}
