import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type FetchCustomerRequest = {
  limit: number;
  offset: number;
  fromDate: string;
  toDate: string;
  fullTextSearch: string;
}

export interface ICustomer {
  id: string;
  orgId: string;
  code: string;
  name: string;
  tags: string;
  entityType: string | null;
  entityCategory: number | null;
  creditTermDay: number | null;
  creditAmount: number | null;
  taxId: string | null;
  nationalCardId: string | null;
  primaryEmail: string;
  primaryPhone: string | null;
  primaryPhoneStatus: string | null;
  secondaryEmail: string | null;
  primaryEmailStatus: string | null;
  content: string;
  totalPoint: number | null;
  pricingPlans: string[];
  createdDate: string;
  updatedDate: string;
}

export type FetchCustomerResponse = ICustomer[];

export const fetchCustomerApi = {
  key: ["fetch-customer"],
  useFetchCustomer: (params: {
    orgId: string;
    params: FetchCustomerRequest;
  }) => {
    return useQuery({
      queryKey: [...fetchCustomerApi.key, params],
      queryFn: () => {
        return api.post<FetchCustomerResponse>(`/api/Customer/org/${params.orgId}/action/GetCustomers`, params.params);
      },
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    })
  },
  useFetchCustomerCount: (params: {
    orgId: string;
    params: FetchCustomerRequest;
  }) => {
    return useQuery({
      queryKey: [...fetchCustomerApi.key, "count", params],
      queryFn: () => {
        return api.post<number>(`/api/Customer/org/${params.orgId}/action/GetCustomerCount`, params.params);
      },
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    })
  }
}
