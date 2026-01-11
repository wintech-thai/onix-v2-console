import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface EnableApiKeyResponse {
  status: string;
  description: string;
}

export const enableApiKeyApi = {
  key: "enable-api-key",
  useEnableApiKey: () => {
    return useMutation({
      mutationKey: [enableApiKeyApi.key],
      mutationFn: (params: {
        orgId: string;
        apiKeyId: string;
      }) => {
        return api.post<EnableApiKeyResponse>(`/api/ApiKey/org/${params.orgId}/action/EnableApiKeyById/${params.apiKeyId}`)
      },
      onError: useErrorToast(),
    })
  }
}
