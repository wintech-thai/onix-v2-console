import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface SendCustomerUserCreationEmailResponse {
  status: string;
  description: string;
}

export const sendCustomerUserCreationEmailApi = {
  key: "send-customer-user-creation-email",
  useSendCustomerUserCreationEmail: () => {
    return useMutation({
      mutationKey: [sendCustomerUserCreationEmailApi.key],
      mutationFn: (params: {
        orgId: string;
        entityId: string;
      }) => {
        return api.post<SendCustomerUserCreationEmailResponse>(`/api/Customer/org/${params.orgId}/action/SendCustomerUserCreationEmail/${params.entityId}`)
      },
      onError: useErrorToast(),
    })
  }
}
