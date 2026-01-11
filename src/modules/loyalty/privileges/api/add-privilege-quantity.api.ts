import { api } from "@/lib/axios";
import { useErrorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

export interface AddPrivilegeQuantityRequest {
  orgId: string;
  privielgeId: string;
  description: string;
  txAmount: number;
  txType: number;
  currentBalance: number;
  previousBalance: number;
}

export interface AddPrivilegeQuantityResponse {
  status: string;
  descript: string;
}

export const addPrivilegeQuantityApi = {
  key: "add-privilege-quantity",
  useAddPrivilegeQuantity: () => {
    return useMutation({
      mutationKey: [addPrivilegeQuantityApi.key],
      mutationFn: (params: {
        orgId: string;
        privilegeId: string;
        body: Omit<AddPrivilegeQuantityRequest, "orgId" | "privielgeId">;
      }) => {
        return api.post<AddPrivilegeQuantityResponse>(
          `/api/Privilege/org/${params.orgId}/action/AddPrivilegeQuantity/${params.privilegeId}`,
          params.body
        );
      },
      onError: useErrorToast(),
    });
  },
};
