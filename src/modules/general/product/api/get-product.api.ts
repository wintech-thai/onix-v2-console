import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { IProduct } from "./fetch-products.api";

export const getProductApi = {
  key: "getProduct",
  useQuery: (params: { orgId: string; productId: string }) => {
    return useQuery<AxiosResponse<IProduct>, AxiosError>({
      queryKey: [getProductApi.key, params],
      queryFn: () => {
        const { orgId, productId } = params
        return api.get<IProduct>(`/api/Item/org/${orgId}/action/GetItemById/${productId}`)
      }
    })
  }
}
