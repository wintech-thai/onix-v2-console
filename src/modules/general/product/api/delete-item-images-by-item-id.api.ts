import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export const deleteItemImagesByItemIdApi = {
  key: "delete-item-images-by-item-id",
  useMutation: () => {
    return useMutation({
      mutationKey: [deleteItemImagesByItemIdApi.key],
      mutationFn: async (params: { orgId: string; itemImageId: string }) => {
        return api.delete(`/api/Item/org/${params.orgId}/action/DeleteItemImageByItemImageId/${params.itemImageId}`)
      },
      onError: useErrorToast(),
    })
  }
}
