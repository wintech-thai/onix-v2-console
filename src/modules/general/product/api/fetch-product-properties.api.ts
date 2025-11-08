import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export type GetProductPropertiesResponse = {
  name: string;
  value: string
}

export const fetchProductsPropertiesApi = {
  key: ["fetch-products-properties"],
  useQuery: (orgId: string) => {
    return useQuery<AxiosResponse<GetProductPropertiesResponse[]>, AxiosError>({
      queryKey: [...fetchProductsPropertiesApi.key, orgId],
      queryFn: () => {
        return api.get(
          `/api/Item/org/${orgId}/action/GetAllowItemPropertyNames`
        )
      }
    })
  },
}
