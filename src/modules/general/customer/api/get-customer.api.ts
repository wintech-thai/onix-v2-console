import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ICustomer } from "./fetch-customer.api";

export type GetCustomerResponse = ICustomer;

export const getCustomerApi = {
  key: "get-customer",
  useGetCustomer: (params: {
    orgId: string;
    customerId: string;
  }) => {
    return useQuery({
      queryKey: [getCustomerApi.key, params],
      queryFn: () => {
        return api.get<GetCustomerResponse>(`/api/Customer/org/${params.orgId}/action/GetCustomerById/${params.customerId}`)
      }
    })
  }
}
