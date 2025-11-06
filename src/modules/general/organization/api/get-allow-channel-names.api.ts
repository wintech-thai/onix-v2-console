import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface GetAllowChannelsNamesResponse {
  name: string;
  value: string;
}

export const getAllowChannelNamesApi = {
  key: "get-allow-channel-names",
  useGetAllowChannelNames: (params: { orgId: string }) => {
    return useQuery<AxiosResponse<GetAllowChannelsNamesResponse[]>, AxiosError>(
      {
        queryKey: [getAllowChannelNamesApi.key, params],
        queryFn: () => {
          return api.get(
            `/api/Organization/org/${params.orgId}/action/GetAllowChannelNames`
          );
        },
      }
    );
  },
};
