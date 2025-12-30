"use client";

import {
  fetchScanItemsHistoryApi,
  IScanItemHistory,
} from "../api/fetch-scan-items-history.api";
import { fetchScanTimelineApi } from "../api/fetch-scan-timeline.api";
import { ScanTimelineChart } from "../components/scan-timeline-chart";
import { ScanItemsHistoryTable } from "../components/scan-items-history-table/scan-items-history.table";
import { useScanItemHistoryTableColumns } from "../components/scan-items-history-table/scan-items-history-columns.table";
import { ScanItemHistoryDetailDialog } from "../components/scan-items-history-detail-dialog";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import { useParams } from "next/navigation";

const ScanItemHistoryViewPage = () => {
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IScanItemHistory[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IScanItemHistory | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (item: IScanItemHistory) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const scanItemHistoryTableColumns = useScanItemHistoryTableColumns({
    onViewDetails: handleViewDetails,
  });

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(50),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
    dateFrom: parseAsString.withDefault(
      dayjs().startOf("day").subtract(30, "day").toISOString()
    ),
    dateTo: parseAsString.withDefault(dayjs().endOf("day").toISOString()),
  });

  const { page, limit, dateFrom, dateTo, searchValue } = queryState;

  // Convert date range from query state
  const dateRange: DateRange | undefined = useMemo(() => {
    if (dateFrom && dateTo) {
      return {
        from: new Date(dateFrom),
        to: new Date(dateTo),
      };
    }
    return undefined;
  }, [dateFrom, dateTo]);

  const fetchScanItemsHistory =
    fetchScanItemsHistoryApi.useFetchScanItemsHistory({
      orgId: params.orgId,
      offset: (page - 1) * limit,
      limit: limit,
      searchValue,
      dateFrom,
      dateTo,
    });

  // Fetch timeline data
  const fetchScanTimeline = fetchScanTimelineApi.useFetchScanTimeline({
    orgId: params.orgId,
    dateFrom,
    dateTo,
    searchValue,
  });

  // Generate color palette for products
  const productColors = useMemo(() => {
    const timelineData = fetchScanTimeline.data?.data || [];
    const uniqueProducts = new Set<string>();

    timelineData.forEach((point) => {
      Object.keys(point.productCounts).forEach((product) => {
        uniqueProducts.add(product);
      });
    });

    const products = Array.from(uniqueProducts).sort();
    const colors: Record<string, string> = {};
    const hueStep = 360 / Math.max(products.length, 1);

    products.forEach((product, index) => {
      const hue = (index * hueStep) % 360;
      colors[product] = `hsl(${hue}, 70%, 50%)`;
    });

    return colors;
  }, [fetchScanTimeline.data]);

  useEffect(() => {
    if (fetchScanItemsHistory.data?.items) {
      // Transform API data to IScanItemHistory format
      const transformedData: IScanItemHistory[] =
        fetchScanItemsHistory.data.items.map((item) => {
          const d = item.source.data ?? {};
          const timestamp = d["@timestamp"] ?? item.source["@timestamp"];
          const contextData = d.ContextData ?? {};
          const geoip = item.source.geoip ?? {};

          return {
            id: item.id,
            timestamp: timestamp,
            serial: contextData.Serial,
            pin: contextData.Pin,
            customerEmail: contextData.CustomerEmail,
            productCode: contextData.ProductCode,
            folderName: contextData.FolderName,
            country: geoip.country_name,
            province: geoip.city_name,
            source: item.source,
          };
        });

      setData(transformedData);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchScanItemsHistory.data]);

  if (fetchScanItemsHistory.isError) {
    throw new Error(fetchScanItemsHistory.error.message);
  }

  const handlePageChange = (newPage: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ page: newPage });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ limit: newLimit, page: 1 }); // Reset to page 1 when changing limit
  };

  const handleSearch = (field: string, value: string, range?: DateRange) => {
    setQueryState({
      searchField: field,
      searchValue: value,
      page: 1,
      dateFrom: range?.from
        ? dayjs(range.from).startOf("day").toISOString()
        : dayjs().startOf("day").toISOString(),
      dateTo: range?.to
        ? dayjs(range.to).endOf("day").toISOString()
        : dayjs().endOf("day").toISOString(),
    }); // Reset to page 1 when searching
  };

  // Get total items count from API
  const totalItems = fetchScanItemsHistory.data?.total ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      {/* Timeline Chart */}
      <ScanTimelineChart
        data={fetchScanTimeline.data?.data || []}
        productColors={productColors}
        isLoading={fetchScanTimeline.isLoading}
        interval={fetchScanTimeline.data?.interval}
      />

      {/* Table */}
      <ScanItemsHistoryTable
        columns={scanItemHistoryTableColumns}
        data={data}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        initialDateRange={dateRange}
        isLoading={
          (fetchScanItemsHistory.isLoading && !hasLoadedBefore) ||
          isPageOrLimitChanging
        }
      />
      {selectedItem?.source && (
        <ScanItemHistoryDetailDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          data={selectedItem.source}
        />
      )}
    </div>
  );
};

export default ScanItemHistoryViewPage;
