import { api } from "@/lib/axios"
import { useMutation } from "@tanstack/react-query"
import { ProductImageSchemaType } from "../schema/product-image.schema"

export const updateItemImageByItemImageIdApi = {
  key: "update-item-image-by-item-image-id",
  useMutation: () => {
    return useMutation({
      mutationKey: [updateItemImageByItemImageIdApi.key],
      mutationFn: async (params: {
        value: ProductImageSchemaType,
        orgId: string,
        itemImageId: string
      }) => {
        return api.post(`/api/Item/org/${params.orgId}/action/UpdateItemImageByItemImageId/${params.itemImageId}`, params.value)
      }
    })
  }
}
