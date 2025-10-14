import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Image } from "./create-product.api";

export type GetProductsRequest = {
  orgId: string;
  offset: number,
  fromDate: string,
  toDate: string,
  limit: number,
  fullTextSearch: string,
  itemType: number
}

export type GetProductsResponse = IProduct[];

export interface IProduct {
  id: string;
  orgId: string;
  code: string;
  description: string;
  tags: string;
  itemType: number;
  narrative: string;
  narratives: string[];
  content: string;
  properties: string;
  propertiesObj: IPropertiesObj;
  images: Image[];
  createdDate: Date;
  updatedDate: Date;
}

export interface IPropertiesObj {
  dimensionUnit: string;
  weightUnit: string;
  category: string;
  supplierUrl: string;
  productUrl: string;
  width: number;
  height: number;
  weight: number;
}


export const fetchProductsApi = {
  fetchProductKey: ["fetch-products"],
  fetchProductFunc: async (params: GetProductsRequest) => {
    return api.post<GetProductsResponse>(`/api/Item/org/${params.orgId}/action/GetItems`, params)
  },
  useFetchProductQuery: (params: GetProductsRequest) => {
    return useQuery({
      queryKey: [...fetchProductsApi.fetchProductKey, params],
      queryFn: () => fetchProductsApi.fetchProductFunc(params),
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    })
  },

  // fetch product count
  useFetchProductCount: (params: GetProductsRequest) => {
    return useQuery({
      queryKey: [...fetchProductsApi.fetchProductKey, "count", params],
      queryFn: async () => {
        return await api.post<number>(`/api/Item/org/${params.orgId}/action/GetItemCount`, params)
      },
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    })
  }
}
