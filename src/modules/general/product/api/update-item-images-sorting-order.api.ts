import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export const updateItemImageSortingOrderApi = {
  key: "update-item-image-sorting-order",
  useMutation: () => {
    return useMutation({
      mutationKey: [updateItemImageSortingOrderApi.key],
      mutationFn: async (params: {
        orgId: string;
        itemId: string;
        imageIds: string[];
      }) => {
        return api.post(`/api/Item/org/${params.orgId}/action/UpdateItemImagesSortingOrder/${params.itemId}`, params.imageIds)
      },
      onError: useErrorToast(),
    })
  }
}
