import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IApiKey } from "./fetch-apikey.api";
import { AxiosError, AxiosResponse } from "axios";

export interface GetApiKeyResponse {
  status: string;
  description: string;
  apiKey: IApiKey;
}

export const getApiKeyApi = {
  key: "get-api-key",
  useGetApiKey: (params: { orgId: string; apikeyId: string }) => {
    return useQuery<AxiosResponse<GetApiKeyResponse>, AxiosError>({
      queryKey: [getApiKeyApi.key, params],
      queryFn: () => {
        return api.get(
          `/api/ApiKey/org/${params.orgId}/action/GetApiKeyById/${params.apikeyId}`
        );
      },
    });
  },
};
