import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface GetCurrentUserResponse {
  status: string;
  description: string;
  user: {
    userId: string;
    userName: string;
    userEmail: string;
    name: string;
    lastName: string;
    phoneNumber: string;
    secondaryEmail: string;
    phoneNumberVerified: string;
    secondaryEmailVerified: string;
    isOrgInitialUser: string;
    userCreatedDate: string;
  }
}

export const getCurrentUserApi = {
  key: "get-current-user",
  useGetCurrentUser: (params: { orgId: string; userName: string }, enabled = true) => {
    return useQuery({
      queryKey: [getCurrentUserApi.key, params],
      queryFn: async () => {
        const response = await api.get<GetCurrentUserResponse>(
          `/api/OnlyUser/org/${params.orgId}/action/GetUserByUserName/${params.userName}`
        );
        return response.data;
      },
      enabled,
    });
  },
};
