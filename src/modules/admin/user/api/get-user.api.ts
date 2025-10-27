import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IUser } from "./fetch-users.api";

export interface GetUserResponse {
  status: string;
  description: string;
  orgUser: IUser;
}

export const getUserApi = {
  key: "get-user",
  useQuery: (params: {
    orgId: string;
    userId: string;
  }) => {
    return useQuery({
      queryKey: [getUserApi.key, params],
      queryFn: () => {
        return api.get<GetUserResponse>(`/api/OrganizationUser/org/${params.orgId}/action/GetUserById/${params.userId}`)
      }
    })
  }
}
