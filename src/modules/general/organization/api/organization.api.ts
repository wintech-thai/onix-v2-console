import { createQueryService } from "@/lib/api-factory";

export interface IUserAllowedMenu {
  groupName: string;
  menuName: string;
  isVisible: boolean;
}

export const getUserAllowedMenu = createQueryService<
  IUserAllowedMenu[],
  null,
  {
    orgId: string;
    userName: string;
  }
>({
  key: ["user-allowed-menu"],
  url: (params) => `/api/OrganizationUser/org/${params.orgId}/action/GetUserAllowedMenu/${params.userName}`,
  method: "get",
});
