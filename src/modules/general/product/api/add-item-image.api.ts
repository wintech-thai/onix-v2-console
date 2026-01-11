import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface AddItemImageResponse {
  status:      string;
  description: string;
}


export const addItemImageApi = {
  key: "add-item-image",
  useMutation: () => {
    return useMutation({
      mutationKey: [addItemImageApi.key],
      mutationFn: async (params: {
        orgId: string;
        itemId: string;
        imagePath: string;
        imageUrl: string;
        narative: string;
        tags: string;
        category: number;
        sortingOrder?: number;
      }) => {
        return api.post<AddItemImageResponse>(
          `/api/Item/org/${params.orgId}/action/AddItemImage/${params.itemId}`,
          {
            imagePath: params.imagePath,
            imageUrl: params.imageUrl,
            narative: params.narative,
            tags: params.tags,
            category: params.category,
            sortingOrder: params.sortingOrder,
          }
        );
      },
      onError: useErrorToast(),
    });
  }
}
