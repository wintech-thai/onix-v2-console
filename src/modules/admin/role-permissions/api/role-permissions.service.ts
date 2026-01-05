import { createQueryService } from "@/lib/api-factory";

export interface IRolePermissions {
  roleId: string;
  orgId: string;
  roleName: string;
  roleDescription: string;
  roleDefinition: string;
  tags: string;
  level: string;
  roleCreatedDate: string;
  permissions: [];
}

export interface FetchCustomRolesRequest {
  offset: number;
  fromDate: string;
  toDate: string;
  limit: number;
  fullTextSearch: string;
  level: string;
}

export interface FetchCustomRolesParams {
  orgId: string;
}

export const getCustomRoles = createQueryService<
  IRolePermissions[],
  FetchCustomRolesRequest,
  FetchCustomRolesParams
>({
  key: ["custom-roles"],
  url: (params) =>
    `/api/CustomRole/org/${params.orgId}/action/GetCustomRoles`,
  method: "post",
});

export const getCustomRoleCount = createQueryService<
  number,
  FetchCustomRolesRequest,
  FetchCustomRolesParams
>({
  key: ["custom-roles-count"],
  url: (params) =>
    `/api/CustomRole/org/${params.orgId}/action/GetCustomRoleCount`,
  method: "post",
});
