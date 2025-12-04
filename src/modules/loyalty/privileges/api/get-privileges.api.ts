import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { IPrivileges } from "./fetch-privileges.api";

export const getPrivilegesApi = {
  key: "get-privileges",
  useGetPrivileges: (params: { orgId: string; privilegeId: string }) => {
    return useQuery<AxiosResponse<IPrivileges>, AxiosError>({
      queryKey: [getPrivilegesApi.key],
      queryFn: () => {
        return api.get(
          `/api/Privilege/org/${params.orgId}/action/GetPrivilegeById/${params.privilegeId}`
        );
      },
    });
  },
};
