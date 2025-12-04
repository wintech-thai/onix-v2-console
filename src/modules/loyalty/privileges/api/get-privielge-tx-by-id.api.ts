import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export interface GetPrivilegeTxByIdRequest {
  limit: number;
  offset: number;
  fromDate: string;
  toDate: string;
}

export interface IPrivilegeTx {
  id: string;
  orgId: string;
  itemId: string;
  tags: string;
  description: string;
  txAmount: number;
  txType: number;
  currentBalance: number;
  previousBalance: number;
  createdDate: string;
  updatedDate: string;
}

export type GetPrivilegeTxByIdResponse = IPrivilegeTx[];

export const getPrivilegeTxByIdApi = {
  key: "get-privilege-tx-by-id",
  useGetPrivilegeTxById: (params: {
    orgId: string;
    privilegeId: string;
    params: GetPrivilegeTxByIdRequest;
  }) => {
    return useQuery<AxiosResponse<GetPrivilegeTxByIdResponse>, AxiosError>({
      queryKey: [...getPrivilegeTxByIdApi.key, params],
      queryFn: () => {
        return api.post(
          `/api/Privilege/org/${params.orgId}/action/GetPrivilegeTxsById/${params.privilegeId}`,
          params.params
        );
      },
    });
  },
  useGetPrivilegeTxByIdCount: (params: {
    orgId: string;
    privilegeId: string;
    params: GetPrivilegeTxByIdRequest;
  }) => {
    return useQuery<AxiosResponse<number>, AxiosError>({
      queryKey: [...getPrivilegeTxByIdApi.key, "count", params],
      queryFn: () => {
        return api.post(
          `/api/Privilege/org/${params.orgId}/action/GetPrivilegeTxsCountById/${params.privilegeId}`,
          params.params
        );
      },
    });
  },
};
