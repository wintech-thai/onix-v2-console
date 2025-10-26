import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface IUser {
  orgUserId: string;
  orgCustomId: string;
  userId: string;
  userName: string;
  createdDate: string;
  rolesList: string;
  isOrgInitialUser: boolean;
  userStatus: string;
  tmpUserEmail: null;
  previousUserStatus: string;
  invitedDate: string;
  invitedBy: string;
  userEmail: string;
  orgName: string;
  orgDesc: string;
  roles: string[];
}

export type FetchUsersResponse = IUser[];

export type FetchUsersRequest = {
  orgId: string;
  offset: number;
  fromDate: string;
  toDate: string;
  limit: number;
  fullTextSearch: string;
};

export const fetchUsersApi = {
  key: ["fetchUser"],
  useFetchUsers: (params: FetchUsersRequest) => {
    return useQuery({
      queryKey: [...fetchUsersApi.key, params],
      queryFn: () => {
        return api.post<FetchUsersResponse>(
          `/api/OrganizationUser/org/${params.orgId}/action/getUsers`,
          params
        );
      },
    });
  },
  useFetchUsersCount: (params: FetchUsersRequest) => {
    return useQuery({
      queryKey: [...fetchUsersApi.key, "count", params],
      queryFn: () => {
        return api.post<number>(
          `/api/OrganizationUser/org/${params.orgId}/action/getUserCount`,
          params
        );
      },
    });
  },
};
