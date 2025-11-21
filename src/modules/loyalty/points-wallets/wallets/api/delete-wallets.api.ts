import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export const deleteWalletApi = {
  key: "delete-wallets",
  useDeleteWallet: () => {
    return useMutation({
      mutationKey: [deleteWalletApi.key],
      mutationFn: (params: { orgId: string; walletId: string }) => {
        return api.delete(
          `/api/Point/org/${params.orgId}/action/DeleteWalletById/${params.walletId}`
        );
      },
      onError: useErrorToast("DeleteWalletById"),
    });
  },
};
