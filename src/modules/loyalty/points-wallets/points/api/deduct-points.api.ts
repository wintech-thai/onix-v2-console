import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useErrorToast } from "@/lib/utils";

export interface DeductPointsRequest {
  orgId: string;
  walletId: string;
  description: string;
  txAmount: number;
  txType: number;
  currentBalance: number;
  previousBalance: number;
}

export interface DeductPointsResponse {
  status: string;
  descript: string;
}

export const deductPointsApi = {
  key: "deduct-points",
  useDeductPoints: () => {
    return useMutation({
      mutationKey: [deductPointsApi.key],
      mutationFn: (params: { orgId: string; params: DeductPointsRequest }) => {
        return api.post<DeductPointsResponse>(
          `/api/Point/org/${params.orgId}/action/DeductPoint/${params.params.walletId}`,
          params.params
        );
      },
      onError: useErrorToast(),
    });
  },
};
