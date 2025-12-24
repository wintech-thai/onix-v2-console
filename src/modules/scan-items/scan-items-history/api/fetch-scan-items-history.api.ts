import { useQuery } from "@tanstack/react-query";

export interface IScanItemHistory {
  id: string;
  timestamp?: string;
  serial?: string;
  pin?: string;
  customerEmail?: string;
  productCode?: string;
  folderName?: string;
  country?: string;
  province?: string;
  source?: Record<string, unknown>;
}

interface FetchScanItemsHistoryResponse {
  total: number;
  limit: number;
  offset: number;
  items: {
    id: string;
    index: string;
    source: {
      data?: {
        ["@timestamp"]?: string;
        ContextData?: {
          Serial?: string;
          Pin?: string;
          CustomerEmail?: string;
          ProductCode?: string;
          FolderName?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      };
      geoip?: {
        country_name?: string;
        city_name?: string;
      };
      ["@timestamp"]?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
  }[];
}

interface FetchScanItemsHistoryParams {
  orgId: string;
  limit: number;
  offset: number;
  searchValue: string;
  dateFrom: string;
  dateTo: string;
}

const fetchScanItemsHistory = async (
  params: FetchScanItemsHistoryParams
): Promise<FetchScanItemsHistoryResponse> => {
  const response = await fetch(
    `/api/scan-items-history?orgId=${params.orgId}&limit=${params.limit}&offset=${params.offset}&dateFrom=${params.dateFrom}&dateTo=${params.dateTo}&searchValue=${params.searchValue}`
  );

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();
};

const useFetchScanItemsHistory = (values: FetchScanItemsHistoryParams) => {
  return useQuery({
    queryKey: ["scan-items-history", values],
    queryFn: () => fetchScanItemsHistory(values),
  });
};

export const fetchScanItemsHistoryApi = {
  key: ["scan-items-history"],
  useFetchScanItemsHistory,
};
