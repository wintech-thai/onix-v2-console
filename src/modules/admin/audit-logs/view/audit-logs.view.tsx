"use client";

import { fetchAuditLogsApi, IAuditLog } from "../api/fetch-audit-logs.api";
import { AuditLogsTable } from "../components/audit-logs-table/audit-logs.table";
import { useAuditLogTableColumns } from "../components/audit-logs-table/audit-logs-columns.table";
import { AuditLogDetailDialog } from "../components/audit-log-detail-dialog";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import { useParams } from "next/navigation";

const AuditLogsView = () => {
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IAuditLog[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [selectedLog, setSelectedLog] = useState<IAuditLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (log: IAuditLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const auditLogTableColumns = useAuditLogTableColumns({ onViewDetails: handleViewDetails });

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(50),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
    dateFrom: parseAsString.withDefault(dayjs().startOf("day").toISOString()),
    dateTo: parseAsString.withDefault(dayjs().endOf("day").toISOString()),
  });

  const { page, limit, dateFrom, dateTo, searchValue } = queryState;

  // Convert date range from query state
  const dateRange: DateRange | undefined = useMemo(() => {
    if (dateFrom && dateTo) {
      return {
        from: new Date(dateFrom),
        to: new Date(dateTo)
      };
    }
    return undefined;
  }, [dateFrom, dateTo]);

  // Fetch audit logs from API
  const fetchAuditLogs = fetchAuditLogsApi.useFetchAuditLogs({
    orgId: params.orgId,
    offset: (page - 1) * limit,
    limit: limit,
    searchValue,
    dateFrom,
    dateTo,
  });

  useEffect(() => {
    if (fetchAuditLogs.data?.items) {
      // Transform API data to IAuditLog format
      const transformedData: IAuditLog[] = fetchAuditLogs.data.items.map(
        (item) => {
          const d = item.source.data ?? {};
          const timestamp = d["@timestamp"] ?? item.source["@timestamp"];

          return {
            id: item.id,
            timestamp: timestamp,
            username: d.userInfo?.UserName,
            identityType: d.userInfo?.IdentityType,
            apiName: d.api?.ApiName,
            statusCode: d.StatusCode,
            role: d.userInfo?.Role,
            ipAddress: d.CfClientIp ?? d.ClientIp,
            source: item.source,
          };
        }
      );

      setData(transformedData);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchAuditLogs.data]);

  if (fetchAuditLogs.isError) {
    throw new Error(fetchAuditLogs.error.message);
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
      dateFrom: range?.from ? dayjs(range.from).startOf("day").toISOString() : dayjs().startOf("day").toISOString(),
      dateTo: range?.to ? dayjs(range.to).endOf("day").toISOString() : dayjs().endOf("day").toISOString(),
    }); // Reset to page 1 when searching
  };

  // Get total items count from API
  const totalItems = fetchAuditLogs.data?.total ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <AuditLogsTable
        columns={auditLogTableColumns}
        data={data}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        initialDateRange={dateRange}
        isLoading={(fetchAuditLogs.isLoading && !hasLoadedBefore) || isPageOrLimitChanging}
      />
      {selectedLog?.source && (
        <AuditLogDetailDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          data={selectedLog.source}
        />
      )}
    </div>
  );
};

export default AuditLogsView;
