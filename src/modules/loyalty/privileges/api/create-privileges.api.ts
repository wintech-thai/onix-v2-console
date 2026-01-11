import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { PrivilegesSchemaType } from "../schema/privileges.schema";
import { useErrorToast } from "@/lib/utils";

export const createPrivilegesApi = {
  key: "create-privileges",
  useCreatePrivileges: () => {
    return useMutation({
      mutationKey: [createPrivilegesApi.key],
      mutationFn: (params: { orgId: string; values: PrivilegesSchemaType }) => {
        return api.post(
          `/api/Privilege/org/${params.orgId}/action/AddPrivilege`,
          params.values
        );
      },
      onError: useErrorToast(),
    });
  },
};
