import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

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
    return useQuery({
      queryKey: [fetchUserRoleApi.key, params],
      queryFn: () => {
        return api.post<FetchUserRoleResponse>(`/api/Role/org/${params.orgId}/action/GetRoles`, params.values)
      }
    })
  }
}
