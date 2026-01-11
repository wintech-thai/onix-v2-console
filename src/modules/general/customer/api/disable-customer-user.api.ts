import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DisableCustomerUserResponse {
  status: string;
  description: string;
}

export const disableCustomerUserApi = {
  key: "disable-customer-user",
  useDisableCustomerUser: () => {
    return useMutation({
      mutationKey: [disableCustomerUserApi.key],
      mutationFn: (params: {
        orgId: string;
        entityId: string;
      }) => {
        return api.post<DisableCustomerUserResponse>(`/api/Customer/org/${params.orgId}/action/DisableCustomerUserById/${params.entityId}`)
      },
      onError: useErrorToast(),
    })
  }
}
