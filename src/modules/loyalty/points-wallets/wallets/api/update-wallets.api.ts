import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface UpdateWalletRequest {
  id: string;
  orgId: string;
  name: string;
  tags: string;
  description: string;
}

export interface UpdateWalletResponse {
  status: string;
  description: string;
}

export const updateWalletApi = {
  key: "update-wallet",
  useUpdateWallet: () => {
    return useMutation({
      mutationKey: [updateWalletApi.key],
      mutationFn: (params: {
        orgId: string;
        walletId: string;
        params: UpdateWalletRequest;
      }) => {
        return api.post<UpdateWalletResponse>(
          `/api/Point/org/${params.orgId}/action/DeductPoint/${params.walletId}`,
          params.params
        );
      },
      onError: useErrorToast("DeductPoint"),
    });
  },
};
