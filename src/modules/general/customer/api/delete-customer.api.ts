import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useErrorToast } from "@/lib/utils";

export interface DeleteCustomerResponse {
  status: string;
  description: string;
}

export const deleteCustomerApi = {
  key: "delete-customer",
  useDeleteCustomer: () => {
    return useMutation({
      mutationKey: [deleteCustomerApi.key],
      mutationFn: (params: {
        orgId: string;
        customerId: string;
      }) => {
        return api.delete<DeleteCustomerResponse>(`/api/Customer/org/${params.orgId}/action/DeleteCustomerCascadeById/${params.customerId}`);
      },
      onError: useErrorToast(),
    })
  }
}
