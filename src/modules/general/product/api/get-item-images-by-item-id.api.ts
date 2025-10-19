import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface GetImageImageByItemIDResponse {
  id: string;
  orgId: string;
  itemId: string;
  imagePath: string;
  imageUrl: string;
  narative: string;
  tags: string;
  category: number;
  sortingOrder: number;
  createdDate: Date;
  updatedDate: Date;
}

export const getItemImageByItemIdApi = {
  key: "get-item-images-by-item-id",
  useQuery: (params: { orgId: string, itemId: string }) => {
    return useQuery({
      queryKey: [getItemImageByItemIdApi.key, params],
      queryFn: async () => {
        return api.get<GetImageImageByItemIDResponse[]>(`/api/Item/org/${params.orgId}/action/GetItemImagesByItemId/${params.itemId}`)
      },
    })
  }
}
