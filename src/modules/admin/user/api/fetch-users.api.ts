import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface IUser {
  orgUserId: string;
  orgCustomId: string;
  userId: string;
  userName: string;
  createdDate: string;
  rolesList: string;
  isOrgInitialUser: string | null;
  userStatus: string;
  tmpUserEmail: string | null;
  previousUserStatus: string  | null;
  invitedDate: string | null;
  invitedBy: string | null;
  userEmail: string | null;
  orgName: string | null;
  orgDesc: string | null;
  roles: string[];
  tags: string | null
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
    return useQuery<AxiosResponse<FetchUsersResponse>, AxiosError>({
      queryKey: [...fetchUsersApi.key, params],
      queryFn: () => {
        return api.post<FetchUsersResponse>(
          `/api/OrganizationUser/org/${params.orgId}/action/getUsers`,
          params
        );
      },
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    });
  },
  useFetchUsersCount: (params: FetchUsersRequest) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [...fetchUsersApi.key, "count", params],
      queryFn: () => {
        return api.post<number>(
          `/api/OrganizationUser/org/${params.orgId}/action/getUserCount`,
          params
        );
      },
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    });
  },
};
