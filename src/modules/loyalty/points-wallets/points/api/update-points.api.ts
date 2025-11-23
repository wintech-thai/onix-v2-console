import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface UpdatePointsRequest {
  orgId: string;
  walletId: string;
  description: string;
  txAmount: number;
  txType: number;
  currentBalance: number;
  previousBalance: number;
}

export const updatePointsApi = {
  key: "update-points",
  useUpdatePoints: () => {
    return useMutation({
      mutationKey: [updatePointsApi.key],
      mutationFn: (params: {
        orgId: string;
        walletId: number;
        params: UpdatePointsRequest;
      }) => {
        return api.post(
          `/api/Point/org/${params.orgId}/action/UpdatePointById/${params.walletId}`,
          params.params
        );
      },
      onError: useErrorToast("UpdatePointById"),
    });
  },
};
