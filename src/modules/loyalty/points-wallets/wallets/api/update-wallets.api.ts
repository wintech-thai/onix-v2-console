import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface UpdateWalletRequest {
  id: string;
  orgId: string;
  name: string;
  tags: string;
  description: string;
  customerId: string;
  pointBalance: number;
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
        return api.post(
          `/api/Point/org/${params.orgId}/action/UpdateWalletById/${params.walletId}`,
          params.params
        );
      },
    });
  },
};
