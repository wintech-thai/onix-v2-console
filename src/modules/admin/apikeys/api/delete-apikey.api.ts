import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface DeleteApiKeyResponse {
  status: string;
  description: string;
}

export const deleteApiKeyApi = {
  key: "delete-api-key",
  useDeleteApiKey: () => {
    return useMutation({
      mutationKey: [deleteApiKeyApi.key],
      mutationFn: (params: {
        orgId: string;
        apiKeyId: string;
      }) => {
        return api.delete<DeleteApiKeyResponse>(`/api/ApiKey/org/${params.orgId}/action/DeleteApiKeyById/${params.apiKeyId}`)
      }
    })
  }
}
