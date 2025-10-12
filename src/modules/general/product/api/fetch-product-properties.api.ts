import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type GetProductPropertiesResponse = {
  name: string;
  value: string
}

export const fetchProductsPropertiesApi = {
  key: ["fetch-products-properties"],
  useQuery: (orgId: string) => {
    return useQuery({
      queryKey: [...fetchProductsPropertiesApi.key, orgId],
      queryFn: () => {
        return api.get<GetProductPropertiesResponse[]>(
          `/api/Item/org/${orgId}/action/GetAllowItemPropertyNames`
        )
      }
    })
  },
}
