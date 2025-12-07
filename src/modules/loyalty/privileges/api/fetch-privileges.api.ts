import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface FetchPrivilegesRequest {
  offset: number;
  fromDate: string;
  toDate: string;
  limit: number;
  fullTextSearch: string;
  itemType: number;
}

export interface IPrivileges {
  id: string;
  orgId: string;
  code: string;
  description: string;
  tags: string;
  itemType: number;
  content: string;
  effectiveDate: string;
  expireDate: string;
  status: string;
  currentBalance: number;
  pointRedeem: number | null;
}

export const fetchPrivilegesApi = {
  key: ["fetch-privileges"] as const,
  useFetchPrivileges: (params: {
    orgId: string;
    params: FetchPrivilegesRequest;
  }) => {
    return useQuery<AxiosResponse<IPrivileges[]>, AxiosError>({
      queryKey: [...fetchPrivilegesApi.key, params.orgId, params.params],
      queryFn: () => {
        return api.post(
          `/api/Privilege/org/${params.orgId}/action/GetPrivileges`,
          params.params
        );
      },
    });
  },
  useFetchRedeemablePrivileges: (params: {
    orgId: string;
    params: FetchPrivilegesRequest;
  }) => {
    return useQuery<AxiosResponse<IPrivileges[]>, AxiosError>({
      queryKey: [...fetchPrivilegesApi.key, "redeemable",  params.orgId, params.params],
      queryFn: () => {
        return api.post(
          `/api/Privilege/org/${params.orgId}/action/GetRedeemablePrivileges`,
          params
        );
      },
    });
  },
  useFetchPrivilegesCount: (params: {
    orgId: string;
    params: FetchPrivilegesRequest;
  }) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [...fetchPrivilegesApi.key, "count", params.orgId, params.params],
      queryFn: () => {
        return api.post(
          `/api/Privilege/org/${params.orgId}/action/GetPrivilegeCount`,
          params.params
        );
      },
    });
  },
};
