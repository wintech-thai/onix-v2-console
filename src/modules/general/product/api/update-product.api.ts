import { api } from "@/lib/axios"
import { useMutation } from "@tanstack/react-query"
import { CreateProductRequest } from "./create-product.api"

export const updateProductApi = {
  key: "updateProduct",
  useMutation: () => {
    return useMutation({
      mutationFn: async ({
        value,
        orgId,
        productId,
      }: {
        value: CreateProductRequest,
        orgId: string,
        productId: string,
      }) => {
        return api.post(`/api/Item/org/${orgId}/action/UpdateItemById/${productId}`, value)
      },
    })
  }
}
