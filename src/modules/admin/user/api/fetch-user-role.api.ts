import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface IUserRole {
  roleId: string;
  roleName: string;
  roleDescription: string;
  roleCreatedDate: string;
  roleDefinition: string;
  roleLevel: string;
}

export type FetchUserRoleResponse = IUserRole[];

export type FetchUserRoleRequest = {
  limit: number,
  offset: number,
  fromDate: string,
  toDate: string,
  fullTextSearch: string,
}

export const fetchUserRoleApi = {
  key: "fetch-user-role",
  useQuery: (params: {
    orgId: string;
    values: FetchUserRoleRequest;
  }) => {
    return useQuery<AxiosResponse<FetchUserRoleResponse>, AxiosError>({
      queryKey: [fetchUserRoleApi.key, params],
      queryFn: () => {
        return api.post<FetchUserRoleResponse>(`/api/Role/org/${params.orgId}/action/GetRoles`, params.values)
      }
    })
  }
}
