import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface CreatePointsRequest {
  orgId: string;
  walletId: string;
  description: string;
  txAmount: number;
  txType: number;
  currentBalance: number;
  previousBalance: number;
}

export interface CreatePointsResponse {
  status: string;
  descript: string;
}

export const createPointsApi = {
  key: "create-points",
  useCreatePoints: () => {
    return useMutation({
      mutationKey: [createPointsApi.key],
      mutationFn: (params: { orgId: string; params: CreatePointsRequest }) => {
        return api.post<CreatePointsResponse>(
          `/api/Point/org/${params.orgId}/action/AddPoint/${params.params.walletId}`,
          params.params
        );
      },
    });
  },
};
