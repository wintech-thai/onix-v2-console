import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { CustomerSchemaType } from "../schema/customer.schema";
import { useErrorToast } from "@/lib/utils";

export interface UpdateCustomerResponse {
  status: string;
  description: string;
}

export const updateCustomerApi = {
  key: "create-customer",
  useUpdateCustomer: () => {
    return useMutation({
      mutationKey: [updateCustomerApi.key],
      mutationFn: (params: {
        orgId: string;
        customerId: string;
        values: CustomerSchemaType;
      }) => {
        return api.post<UpdateCustomerResponse>(`/api/Customer/org/${params.orgId}/action/UpdateCustomerById/${params.customerId}`, params.values)
      },
      onError: useErrorToast(),
    })
  }
}
