import { api } from "@/lib/axios"
import { useMutation } from "@tanstack/react-query"

export interface DeleteProductResponse {
  status: string;
  description: string;
}

export const deleteProductApi = {
  key: "delete-product",
  useMutation: () => {
    return useMutation({
      mutationKey: [deleteProductApi.key],
      mutationFn: async ({
        orgId,
        productId,
      }: {
        orgId: string,
        productId: string,
      }) => {
        return api.delete<DeleteProductResponse>(`/api/Item/org/${orgId}/action/DeleteItemById/${productId}`)
      }
    })
  }
}
