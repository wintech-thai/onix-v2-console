import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DeletePrivilegesResponse {
  status: string;
  description: string;
}

export const deletePrivilegesApi = {
  key: "delete-privileges",
  useDeletePrivileges: () => {
    return useMutation({
      mutationKey: [deletePrivilegesApi.key],
      mutationFn: (params: { orgId: string; privilegeId: string }) => {
        return api.delete(
          `/api/Privilege/org/${params.orgId}/action/DeletePrivilegeById/${params.privilegeId}`
        );
      },
      onError: useErrorToast("DeletePrivilegeById")
    });
  },
};
