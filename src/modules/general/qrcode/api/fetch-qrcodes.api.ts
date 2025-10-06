import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type GetScanItemsRequest = {
  orgId: string;
  offset: number;
  fromDate: string;
  toDate: string;
  limit: number;
  fullTextSearch: string;
}

export type GetScanItemsResponse = IScanItems[];

// Backward compatibility - deprecated, use GetScanItemsRequest instead
/** @deprecated Use GetScanItemsRequest instead */
export type GetQrCodesRequest = GetScanItemsRequest;
/** @deprecated Use GetScanItemsResponse instead */
export type GetQrCodesResponse = GetScanItemsResponse;

export interface IScanItems {
  id: string;
  orgId: string;
  serial: string;
  pin: string;
  tags: null | string;
  productCode: null | string;
  sequenceNo: string;
  url: string;
  runId: string;
  uploadedPath: string;
  itemGroup: string;
  registeredFlag: string;
  scanCount: number;
  usedFlag: null | string;
  itemId: null | string;
  appliedFlag: null | string;
  customerId: null | string;
  createdDate: Date;
  registeredDate: Date;
}


export const fetchScanItemsApi = {
  fetchScanItemsKey: ["fetch-scan-items"],
  fetchScanItemsFunc: async (params: GetScanItemsRequest) => {
    return api.post<GetScanItemsResponse>(`/api/ScanItem/org/${params.orgId}/action/GetScanItems`, params)
  },
  useFetchScanItemsQuery: (params: GetScanItemsRequest) => {
    return useQuery({
      queryKey: [...fetchScanItemsApi.fetchScanItemsKey, params],
      queryFn: () => fetchScanItemsApi.fetchScanItemsFunc(params),
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    })
  },

  // fetch scan items count
  useFetchScanItemsCount: (params: GetScanItemsRequest) => {
    return useQuery({
      queryKey: [...fetchScanItemsApi.fetchScanItemsKey, "count", params],
      queryFn: async () => {
        return await api.post<number>(`/api/ScanItem/org/${params.orgId}/action/GetScanItemCount`, params)
      },
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    })
  }
}

// Backward compatibility - deprecated, use fetchScanItemsApi instead
/** @deprecated Use fetchScanItemsApi instead */
export const fetchQrCodeApi = fetchScanItemsApi;
