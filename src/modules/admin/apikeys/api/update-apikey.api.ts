import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface UpdateAPIKeyRequest {
  keyName: string;
  keyDescription: string;
  roles: string[];
}

export interface UpdateAPIKeyResponse {
  status: string;
  description: string;
}

export const updateApiKeyApi = {
  key: "create-api-key",
  useUpdateApiKey: () => {
    return useMutation({
      mutationKey: [updateApiKeyApi.key],
      mutationFn: (params: {
        orgId: string;
        apiKeyId: string;
        values: UpdateAPIKeyRequest;
      }) => {
        return api.post<UpdateAPIKeyResponse>(
          `/api/ApiKey/org/${params.orgId}/action/UpdateApiKeyById/${params.apiKeyId}`,
          params.values
        );
      },
      onError: useErrorToast("UpdateApiKeyById"),
    });
  },
};
