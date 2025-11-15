import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { CurrentUserSchemaType } from "../schema/current-user.schema";

export interface UpdateCurrentUserResponse {
  status: string;
  description: string;
}

export const updateCurrentUserApi = {
  key: "update-current-user",
  useUpdateCurrentUser: () => {
    return useMutation({
      mutationKey: [updateCurrentUserApi.key],
      mutationFn: async (params: {
        orgId: string;
        userName: string;
        values: CurrentUserSchemaType;
      }) => {
        const response = await api.post<UpdateCurrentUserResponse>(
          `/api/OnlyUser/org/${params.orgId}/action/UpdateUserByUserName/${params.userName}`,
          {
            name: params.values.name,
            lastName: params.values.lastName,
            phoneNumber: `+${params.values.phoneNumber}`,
            secondaryEmail: params.values.secondaryEmail || "",
          }
        );
        return response.data;
      },
    });
  },
};
