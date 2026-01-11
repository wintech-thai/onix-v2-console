import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { PrivilegesSchemaType } from "../schema/privileges.schema";
import { useErrorToast } from "@/lib/utils";

export const updatePrivilegesApi = {
  key: "create-privileges",
  useCreatePrivileges: () => {
    return useMutation({
      mutationKey: [updatePrivilegesApi.key],
      mutationFn: (params: {
        orgId: string;
        privilegeId: string;
        values: PrivilegesSchemaType
      }) => {
        return api.post(`/api/Privilege/org/${params.orgId}/action/UpdatePrivilegeById/${params.privilegeId}`, params.values)
      },
      onError: useErrorToast()
    })
  }
}

