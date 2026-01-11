import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useErrorToast } from "@/lib/utils";

export interface CreateProductRequest {
  orgId: string;
  code: string;
  description: string;
  tags: string;
  itemType: number;
  narrative: string;
  content: string;
  properties: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propertiesObj: any;
  narratives: string[];
  images: Image[];
}

export interface Image {
  id: string;
  orgId: string;
  itemId: string;
  item: string;
  imagePath: string;
  imageUrl: string;
  narative: string;
  tags: string;
  category: number;
  sortingOrder: number;
  createdDate: Date;
  updatedDate: Date;
}

// export interface PropertiesObj {
//   dimensionUnit: string;
//   weightUnit: string;
//   category: string;
//   supplierUrl: string;
//   productUrl: string;
//   width: number;
//   height: number;
//   weight: number;
// }

export interface CreateProductResponse {
  status: string;
  description: string;
}

export const createProductApi = {
  key: "create-product",
  useMutation: () => {
    return useMutation({
      mutationKey: [createProductApi.key],
      mutationFn: async ({
        params: { orgId, ...params },
      }: {
        params: CreateProductRequest;
      }) => {
        return await api.post<CreateProductResponse>(`/api/Item/org/${orgId}/action/AddItem`, params)
      },
      onError: useErrorToast(),
    })
  }
}
