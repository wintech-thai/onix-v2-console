import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DisableApiKeyResponse {
  status: string;
  description: string;
}

export const disableApiKeyApi = {
  key: "disable-api-key",
  useDisableApiKey: () => {
    return useMutation({
      mutationKey: [disableApiKeyApi.key],
      mutationFn: (params: {
        orgId: string;
        apiKeyId: string;
      }) => {
        return api.post<DisableApiKeyResponse>(`/api/ApiKey/org/${params.orgId}/action/DisableApiKeyById/${params.apiKeyId}`)
      },
      onError: useErrorToast("DisableApiKeyById"),
    })
  }
}
