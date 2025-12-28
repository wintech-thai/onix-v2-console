import { useQuery } from "@tanstack/react-query";

export interface TimelineDataPoint {
  timestamp: string;
  total: number;
  productCounts: Record<string, number>;
}

export interface ScanTimelineResponse {
  data: TimelineDataPoint[];
  interval: string;
  total: {
    value: number;
    relation: string;
  };
}

interface FetchScanTimelineParams {
  orgId: string;
  dateFrom: string;
  dateTo: string;
  searchValue?: string;
}

const fetchScanTimeline = async (
  params: FetchScanTimelineParams
): Promise<ScanTimelineResponse> => {
  const searchParams = new URLSearchParams({
    orgId: params.orgId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  if (params.searchValue) {
    searchParams.append("searchValue", params.searchValue);
  }

  const response = await fetch(`/api/scan-timeline?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch scan timeline");
  }

  return response.json();
};

export const fetchScanTimelineApi = {
  useFetchScanTimeline: (params: FetchScanTimelineParams) => {
    return useQuery({
      queryKey: ["scan-timeline", params],
      queryFn: () => fetchScanTimeline(params),
      enabled: !!params.orgId && !!params.dateFrom && !!params.dateTo,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  },
};
