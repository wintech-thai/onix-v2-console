"use client";

import { useParams } from "next/navigation";
import {
  fetchPointTriggerApi,
  IPointTrigger,
} from "../api/fetch-point-triggers.api";
import { PointTriggersTable } from "../components/point-triggers-table/point-triggers.table";
import { usePointTriggerTableColumns } from "../components/point-triggers-table/point-triggers-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const PointTriggersView = () => {
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IPointTrigger[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);

  const pointTriggerTableColumns = usePointTriggerTableColumns();

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
  });

  const { page, limit, searchField, searchValue } = queryState;

  // Memoize dates to prevent infinite refetch loop
  const dateRange = useMemo(
    () => ({
      fromDate: dayjs().subtract(1, "day").toISOString(),
      toDate: dayjs().toISOString(),
    }),
    []
  );

  // Fetch Point Triggers from API
  const fetchPointTriggers = fetchPointTriggerApi.useFetchPointTrigger({
    orgId: params.orgId,
    values: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    },
  });

  useEffect(() => {
    if (fetchPointTriggers.data?.data) {
      setData(fetchPointTriggers.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchPointTriggers.data]);

  const fetchPointTriggersCount =
    fetchPointTriggerApi.useFetchPointTriggerCount({
      orgId: params.orgId,
      values: {
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        offset: (page - 1) * limit,
        limit: limit,
        fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
      },
    });

  if (fetchPointTriggers.isError) {
    if (fetchPointTriggers.error.response?.status === 403) {
      return <NoPermissionsPage errors={fetchPointTriggers.error} />;
    }
    throw new Error(fetchPointTriggers.error.message);
  }

  if (fetchPointTriggersCount.isError) {
    if (fetchPointTriggersCount.error.response?.status === 403) {
      return <NoPermissionsPage errors={fetchPointTriggersCount.error} />;
    }
    throw new Error(fetchPointTriggersCount.error.message);
  }

  const handlePageChange = (newPage: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ page: newPage });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ limit: newLimit, page: 1 });
  };

  const handleSearch = (field: string, value: string) => {
    setQueryState({ searchField: field, searchValue: value, page: 1 });
  };

  // Get total items count from API
  const totalItems = fetchPointTriggersCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <PointTriggersTable
        columns={pointTriggerTableColumns}
        data={data}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={
          (fetchPointTriggers.isLoading && !hasLoadedBefore) ||
          isPageOrLimitChanging
        }
      />
    </div>
  );
};

export default PointTriggersView;
