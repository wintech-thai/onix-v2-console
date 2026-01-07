import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface EnableCustomerUserResponse {
  status: string;
  description: string;
}

export const enableCustomerUserApi = {
  key: "enable-customer-user",
  useEnableCustomerUser: () => {
    return useMutation({
      mutationKey: [enableCustomerUserApi.key],
      mutationFn: (params: {
        orgId: string;
        entityId: string;
      }) => {
        return api.post<EnableCustomerUserResponse>(`/api/Customer/org/${params.orgId}/action/EnableCustomerUserById/${params.entityId}`)
      },
      onError: useErrorToast("EnableCustomerUserById"),
    })
  }
}
