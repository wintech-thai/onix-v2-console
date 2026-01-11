import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { CustomerSchemaType } from "../schema/customer.schema";
import { useErrorToast } from "@/lib/utils";

export interface CreateCustomerResponse {
  status: string;
  description: string;
}

export const createCustomerApi = {
  key: "create-customer",
  useCreateCustomer: () => {
    return useMutation({
      mutationKey: [createCustomerApi.key],
      mutationFn: (params: {
        orgId: string;
        values: CustomerSchemaType;
      }) => {
        return api.post(`/api/Customer/org/${params.orgId}/action/AddCustomer`, params.values)
      },
      onError: useErrorToast(),
    })
  }
}
