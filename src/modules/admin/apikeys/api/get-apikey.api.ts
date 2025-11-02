import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IApiKey } from "./fetch-apikey.api";

export const getApiKeyApi = {
  key: "get-api-key",
  useGetApiKey: (params: {
    orgId: string;
    apiKeyId: string;
  }) => {
    return useQuery({
      queryKey: [getApiKeyApi.key],
      queryFn: () => {
        return api.get<IApiKey>(`/api/ApiKey/org/${params.orgId}/action/GetApiKeyById/${params.apiKeyId}`)
      }
    })
  }
}
