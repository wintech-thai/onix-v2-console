import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { IApiKey } from "./fetch-apikey.api";

export interface CreateAPIKeyRequest {
  keyName: string;
  keyDescription: string;
  roles: string[];
}

export interface CreateAPIKeyResponse {
  status: string;
  description: string;
  apiKey: IApiKey;
}

export const createApiKeyApi = {
  key: "create-api-key",
  useCreateApiKey: () => {
    return useMutation({
      mutationKey: [createApiKeyApi.key],
      mutationFn: (params: {
        orgId: string;
        values: CreateAPIKeyRequest
      }) => {
        return api.post<CreateAPIKeyResponse>(`/api/ApiKey/org/${params.orgId}/action/AddApiKey`, params.values)
      }
    })
  }
}
