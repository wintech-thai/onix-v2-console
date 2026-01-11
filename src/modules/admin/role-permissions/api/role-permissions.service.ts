import { createQueryService, createMutationService } from "@/lib/api-factory";

export interface IRolePermissions {
  roleId: string;
  orgId: string;
  roleName: string;
  roleDescription: string;
  roleDefinition: string;
  tags: string;
  level: string;
  roleCreatedDate: string;
  permissions: IUserRolePermissions[];
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
  url: (params) => `/api/CustomRole/org/${params.orgId}/action/GetCustomRoles`,
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

export interface IUserRolePermissions {
  controllerName: string;
  apiPermissions: {
    controllerName: string;
    apiName: string;
    isAllowed: boolean;
  }[];
}

export interface CustomRoleRequest {
  orgId: string;
  roleName: string;
  roleDescription: string;
  tags: string;
  permissions: IUserRolePermissions[];
}

export interface CustomRoleResponse {
  status: string;
  description: string;
}

export interface AddCustomRoleParams {
  orgId: string;
}

export const addCustomRole = createMutationService<
  CustomRoleResponse,
  CustomRoleRequest,
  AddCustomRoleParams
>({
  apiName: "addCustomRole",
  url: (params) =>
    `/api/CustomRole/org/${params.orgId}/action/AddCustomRole`,
  method: "post",
});

export interface UpdateCustomRoleParams {
  orgId: string;
  customRoleId: string;
}

export const updateCustomRole = createMutationService<
  CustomRoleResponse,
  CustomRoleRequest,
  UpdateCustomRoleParams
>({
  apiName: "updateCustomRole",
  url: (params) =>
    `/api/CustomRole/org/${params.orgId}/action/UpdateCustomRoleById/${params.customRoleId}`,
  method: "post",
});


export interface GetInitialUserRolePermissionsResponse {
  status: string;
  message: string;
  permissions: IUserRolePermissions[];
}

export const getInitialUserRolePermissions = createQueryService<
  GetInitialUserRolePermissionsResponse,
  void,
  FetchCustomRolesParams
>({
  key: ["initial-user-role-permissions"],
  url: (params) =>
    `/api/CustomRole/org/${params.orgId}/action/GetInitialUserRolePermissions`,
  method: "get",
});

export interface GetCustomRoleByIdResponse {
  status: string;
  message: string;
  customRole: IRolePermissions;
}

export interface GetCustomRoleByIdParams {
  orgId: string;
  id: string;
}

export const getCustomRoleById = createQueryService<
  GetCustomRoleByIdResponse,
  void,
  GetCustomRoleByIdParams
>({
  key: ["custom-role-by-id"],
  url: (params) =>
    `/api/CustomRole/org/${params.orgId}/action/GetCustomRoleById/${params.id}`,
  method: "get",
});

export const deleteCustomRoleById = createMutationService<
  CustomRoleResponse,
  void,
  GetCustomRoleByIdParams
>({
  apiName: "deleteCustomRoleById",
  url: (params) =>
    `/api/CustomRole/org/${params.orgId}/action/DeleteCustomRoleById/${params.id}`,
  method: "delete",
})
