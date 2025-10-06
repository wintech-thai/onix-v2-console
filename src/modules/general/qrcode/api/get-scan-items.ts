import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type GetScanItemsRequest = {
  orgId: string;
  scanItemId: string;
}

export interface GetScanItemsResponse {
  status: string;
  description: string;
  scanItem: ScanItem;
}

export interface ScanItem {
  id: string;
  orgId: string;
  serial: string;
  pin: string;
  tags: null;
  productCode: null;
  sequenceNo: string;
  url: string;
  runId: string;
  uploadedPath: string;
  itemGroup: string;
  registeredFlag: string;
  scanCount: number;
  usedFlag: null;
  itemId: null;
  appliedFlag: null;
  customerId: null;
  createdDate: Date;
  registeredDate: Date;
}


export const getScanItemsApi = {
  getScanItemsKey: ["get-scan-items"],
  getScanItemsFunc: async (params: GetScanItemsRequest) => {
    return api.get<GetScanItemsResponse>(`/api/ScanItem/org/${params.orgId}/action/GetScanItemById/${params.scanItemId}`)
  },
  useGetScanItemsQuery: (params: GetScanItemsRequest, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: [...getScanItemsApi.getScanItemsKey, params],
      queryFn: () => getScanItemsApi.getScanItemsFunc(params),
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      enabled: options?.enabled,
    })
  },
}
