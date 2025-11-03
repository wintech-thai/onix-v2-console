import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IApiKey } from "./fetch-apikey.api";

export interface GetApiKeyResponse {
  status: string;
  description: string;
  apiKey: IApiKey;
}

export const getApiKeyApi = {
  key: "get-api-key",
  useGetApiKey: (params: {
    orgId: string;
    apiKeyId: string;
  }) => {
    return useQuery({
      queryKey: [getApiKeyApi.key, params],
      queryFn: () => {
        console.log("params", params);
        const url = `/api/ApiKey/org/${params.orgId}/action/GetApiKeyById/${params.apiKeyId}`;
        console.log("url", url);
        return api.get<GetApiKeyResponse>(url)
      }
    })
  }
}
