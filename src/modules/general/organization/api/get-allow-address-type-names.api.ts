import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface GetAllowAddressTypeNamesResponse {
  name: string;
  value: string;
}

export const getAllowAddressTypeNamesApi = {
  key: "get-allow-address-types-name",
  useGetAllowAddressTypesName: (params: { orgId: string }) => {
    return useQuery<
      AxiosResponse<GetAllowAddressTypeNamesResponse[]>,
      AxiosError
    >({
      queryKey: [getAllowAddressTypeNamesApi.key, params],
      queryFn: () => {
        return api.get(
          `/api/Organization/org/${params.orgId}/action/GetAllowAddressTypeNames`
        );
      },
    });
  },
};
