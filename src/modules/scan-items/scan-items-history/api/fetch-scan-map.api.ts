import { useQuery } from "@tanstack/react-query";

export interface MapDataPoint {
  id: string;
  location: {
    lat: number;
    lon: number;
  };
  country?: string;
  province?: string;
  productCode?: string;
  productDesc?: string;
  email?: string;
}

export interface ProductAggregation {
  productCode: string;
  productDesc: string;
  count: number;
}

export interface ProvinceAggregation {
  province: string;
  count: number;
}

export interface EmailAggregation {
  email: string;
  count: number;
}

interface FetchScanMapDataResponse {
  mapData: MapDataPoint[];
  aggregations: {
    byProduct: ProductAggregation[];
    byProvince: ProvinceAggregation[];
    byEmail: EmailAggregation[];
  };
}

interface FetchScanMapDataParams {
  orgId: string;
  dateFrom: string;
  dateTo: string;
  searchField?: string;
  searchValue?: string;
}

const fetchScanMapData = async (
  params: FetchScanMapDataParams
): Promise<FetchScanMapDataResponse> => {
  const searchParams = new URLSearchParams({
    orgId: params.orgId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  if (params.searchField) {
    searchParams.set("searchField", params.searchField);
  }
  if (params.searchValue) {
    searchParams.set("searchValue", params.searchValue);
  }

  const response = await fetch(`/api/scan-map?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();
};

const useFetchScanMapData = (values: FetchScanMapDataParams) => {
  return useQuery({
    queryKey: ["scan-map", values],
    queryFn: () => fetchScanMapData(values),
  });
};

export const fetchScanMapDataApi = {
  key: ["scan-map"],
  useFetchScanMapData,
};
