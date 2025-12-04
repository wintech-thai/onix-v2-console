import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface DeductPrivilegeQuantityRequest {
  orgId: string;
  privielgeId: string;
  description: string;
  txAmount: number;
  txType: number;
  currentBalance: number;
  previousBalance: number;
}

export interface DeductPrivilegeQuantityResponse {
  status: string;
  descript: string;
}

export const deDuctPrivilegeQuantityApi = {
  key: "deduct-privilege-quantity",
  useDeductPrivilegeQuantity: () => {
    return useMutation({
      mutationKey: [deDuctPrivilegeQuantityApi.key],
      mutationFn: (params: {
        orgId: string;
        privilegeId: string;
        body: Omit<DeductPrivilegeQuantityRequest, "orgId" | "privielgeId">;
      }) => {
        return api.post<DeductPrivilegeQuantityResponse>(
          `/api/Privilege/org/${params.orgId}/action/DeductPrivilegeQuantity/${params.privilegeId}`,
          params.body
        );
      },
      onError: useErrorToast("DeductPrivilegeQuantity"),
    });
  },
};
