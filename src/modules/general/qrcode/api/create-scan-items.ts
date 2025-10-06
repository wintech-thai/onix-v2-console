import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface CreateScanItemRequest {
  id?: string
  orgId?: string;
  serial: string;
  pin: string;
  tags?: string;
  productCode?: string;
  sequenceNo?: string;
  url?: string;
  runId?: string;
  uploadedPath?: string;
  itemGroup?: string;
  registeredFlag?: string;
  scanCount?: number;
  usedFlag?: string;
  itemId?: string;
  appliedFlag?: string;
  customerId?: string;
  createdDate?: Date;
  registeredDate?: Date;
}


export const createScanItemsApi = {
  createScanItemsKey: ["create-scan-items"],
  createScanItemsFunc: async (params: CreateScanItemRequest) => {
    return api.post<void>(`/api/ScanItem/org/${params.orgId}/action/AddScanItem`, params);
  },
  useCreateScanItemsMutation: () => {
    return useMutation({
      mutationKey: [...createScanItemsApi.createScanItemsKey],
      mutationFn: (params: CreateScanItemRequest) => createScanItemsApi.createScanItemsFunc(params),
    });
  }
}
