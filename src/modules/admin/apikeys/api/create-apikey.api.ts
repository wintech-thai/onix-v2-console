import { api } from "@/lib/axios";
import { IApiKey } from "./fetch-apikey.api";
import { useAxiosMutation, useErrorToast } from "@/lib/utils";

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
    return useAxiosMutation<
      CreateAPIKeyResponse,
      { orgId: string; values: CreateAPIKeyRequest }
    >({
      mutationKey: [createApiKeyApi.key],
      mutationFn: (params) => {
        return api.post<CreateAPIKeyResponse>(
          `/api/ApiKey/org/${params.orgId}/action/AddApiKey`,
          params.values
        );
      },
      onError: useErrorToast(),
    });
  },
};
