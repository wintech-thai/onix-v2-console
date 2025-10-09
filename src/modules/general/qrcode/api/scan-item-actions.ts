import { api } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import z from "zod";
import { scanItemActionSchema } from "../schema/scan-item-action.schema";

export interface ScanItemAction {
  id: string;
  orgId: string;
  redirectUrl: string;
  encryptionKey: string;
  encryptionIV: string;
  themeVerify: string;
  registeredAwareFlag: string;
  createdDate: Date;
}

export type GetScanItemActionResponse = ScanItemAction;
export type GetScanItemDefaultResponse = ScanItemAction;

export type AddScanItemActionRequest = z.infer<typeof scanItemActionSchema>;

export interface AddScanItemActionResponse {
  status: string;
  description: string;
  scanItemAction: ScanItemAction;
}

// Mutation param types for clarity
export type AddScanItemActionMutationParams = {
  value: AddScanItemActionRequest;
  orgId: string;
};

export type UpdateScanItemActionMutationParams = {
  value: AddScanItemActionRequest;
  orgId: string;
  itemId: string;
};

export const scanItemActionApi = {
  getScanItemAction: {
    key: "getScanItemAction",
    useQuery: (orgId: string) => {
      return useQuery({
        queryKey: [scanItemActionApi.getScanItemAction.key, orgId],
        queryFn: () => {
          return api.get<GetScanItemActionResponse>(`/api/ScanItemAction/org/${orgId}/action/GetScanItemAction`)
        }
      })
    }
  },

  getScanItemDefault: {
    key: "getScanItemDefault",
    useMutation: () => {
      return useMutation({
        mutationKey: [scanItemActionApi.getScanItemDefault.key],
        mutationFn: (orgId: string) => {
          return api.get<GetScanItemDefaultResponse>(`/api/ScanItemAction/org/${orgId}/action/GetScanItemActionDefault`)
        }
      })
    }
  },

  addScanItemAction: {
    key: "addScanItemAction",
    useMutation: () => {
      return useMutation({
        mutationKey: [scanItemActionApi.addScanItemAction.key],
        mutationFn: (params: AddScanItemActionMutationParams) => {
          const { value, orgId } = params;
          return api.post<AddScanItemActionResponse>(`/api/ScanItemAction/org/${orgId}/action/AddScanItemAction`, value)
        }
      })
    }
  },

  updateScanItemAction: {
    key: "updateScanItemAction",
    useMutation: () => {
      return useMutation({
        mutationKey: [scanItemActionApi.updateScanItemAction.key],
        mutationFn: (params: UpdateScanItemActionMutationParams) => {
          const { value, orgId, itemId } = params;
          return api.post<AddScanItemActionResponse>(`/api/ScanItemAction/org/${orgId}/action/UpdateScanItemActionById/${itemId}`, value)
        }
      })
    }
  }
}
