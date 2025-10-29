import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface UpdateCustomerEmailWithConfirmationResponse {
  status: string;
  description: string;
}

export interface UpdateCustomerEmailResponse {
  status: string;
  description: string;
}

export const updateCustomerEmailApi = {
  key: "update-customer-email",
  useUpdateVerifyCustomerEmail: () => {
    return useMutation({
      mutationKey: [updateCustomerEmailApi.key, "verify"],
      mutationFn: (params: {
        orgId: string;
        customerId: string;
        email: string;
      }) => {
        return api.post<UpdateCustomerEmailWithConfirmationResponse>(`/api/Customer/org/${params.orgId}/action/UpdateCustomerEmailWithConfirmationById/${params.customerId}/${params.email}`)
      }
    })
  },
  useUpdateUpdateCustomerEmail: () => {
    return useMutation({
      mutationKey: [updateCustomerEmailApi.key, "update"],
      mutationFn: (params: {
        orgId: string;
        customerId: string;
        email: string;
      }) => {
        return api.post<UpdateCustomerEmailResponse>(`/api/Customer/org/${params.orgId}/action/UpdateCustomerEmailById/${params.customerId}/${params.email}`)
      }
    })
  }
}
