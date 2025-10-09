import { api } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ScanItemTemplateSchemaType } from "../schema/scan-item-themplate.schema";

export interface ScanItemThemplate {
  id: string;
  orgId: string;
  serialPrefixDigit: number;
  generatorCount: number;
  serialDigit: number;
  pinDigit: number;
  urlTemplate: string;
  notificationEmail: string;
  createdDate: Date;
}

export type GetScanItemThemplateResponse = ScanItemThemplate;
export type GetScanItemThempleteDefaultResponse = ScanItemThemplate;

export type AddScanItemThemplateRequest = ScanItemTemplateSchemaType;

export interface AddScanItemThemplateResponse {
  status: string;
  description: string;
}

// Mutation param types for clarity
export type AddScanItemThemplateMutationParams = {
  value: AddScanItemThemplateRequest;
  orgId: string;
};

export type UpdateScanItemThemplateMutationParams = {
  value: AddScanItemThemplateRequest;
  orgId: string;
  itemId: string;
};

export const scanItemThemplateApi = {
  getScanItemThemplate: {
    key: "getScanItemThemplate",
    useQuery: (orgId: string) => {
      return useQuery({
        queryKey: [scanItemThemplateApi.getScanItemThemplate.key, orgId],
        queryFn: () => {
          return api.get<GetScanItemThemplateResponse>(`/api/ScanItemTemplate/org/${orgId}/action/GetScanItemTemplate`)
        }
      })
    }
  },

  getScanItemThemplateDefault: {
    key: "getScanItemThemplateDefault",
    useMutation: () => {
      return useMutation({
        mutationKey: [scanItemThemplateApi.getScanItemThemplateDefault.key],
        mutationFn: (orgId: string) => {
          return api.get<GetScanItemThemplateResponse>(`/api/ScanItemTemplate/org/${orgId}/action/GetScanItemTemplateDefault`)
        }
      })
    }
  },

  addScanItemThemplate: {
    key: "addScanItemThemplate",
    useMutation: () => {
      return useMutation({
        mutationKey: [scanItemThemplateApi.addScanItemThemplate.key],
        mutationFn: (params: AddScanItemThemplateMutationParams) => {
          const { value, orgId } = params;
          return api.post<AddScanItemThemplateResponse>(`/api/ScanItemTemplate/org/${orgId}/action/AddScanItemTemplate`, value)
        }
      })
    }
  },

  updateScanItemThemplate: {
    key: "updateScanItemThemplate",
    useMutation: () => {
      return useMutation({
        mutationKey: [scanItemThemplateApi.updateScanItemThemplate.key],
        mutationFn: (params: UpdateScanItemThemplateMutationParams) => {
          const { value, orgId, itemId } = params;
          return api.post<AddScanItemThemplateResponse>(`/api/ScanItemTemplate/org/${orgId}/action/UpdateScanItemTemplateById/${itemId}`, value)
        }
      })
    }
  }
}
