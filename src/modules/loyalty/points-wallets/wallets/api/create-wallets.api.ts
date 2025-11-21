import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface CreateWalletRequest {
  orgId: string;
  name: string;
  tags: string;
  description: string;
  customerId: string;
  pointBalance: number;
}

export const createWalletApi = {
  key: "create-wallet",
  useCreateWallet: () => {
    return useMutation({
      mutationKey: [createWalletApi.key],
      mutationFn: (params: { orgId: string; params: CreateWalletRequest }) => {
        return api.post(
          `/api/Point/org/${params.orgId}/action/AddWallet`,
          params.params
        );
      },
    });
  },
};
