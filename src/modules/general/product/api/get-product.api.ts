import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IProduct } from "./fetch-products.api";

export const getProductApi = {
  key: "getProduct",
  useQuery: (params: { orgId: string; productId: string }) => {
    return useQuery({
      queryKey: [getProductApi.key, params],
      queryFn: async () => {
        const { orgId, productId } = params
        return api.get<IProduct>(`/api/Item/org/${orgId}/action/GetItemById/${productId}`)
      }
    })
  }
}
