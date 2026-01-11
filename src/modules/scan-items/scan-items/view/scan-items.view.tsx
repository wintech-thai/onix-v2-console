"use client";

import { useParams, useRouter } from "next/navigation";
import { fetchScanItemsApi, IScanItems } from "../api/fetch-qrcodes.api";
import { QrCodeTable } from "../components/scan-items-table/scan-items.table";
import { useQrcodeTableColumns } from "../components/scan-items-table/scan-items-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteScanItemsApi } from "../api/delete-scan-items";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { RouteConfig } from "@/config/route.config";

const ScanItemsView = () => {
  const router = useRouter();
  const { t } = useTranslation(["scan-item"]);
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IScanItems[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });
  const queryClient = useQueryClient();

  const scanItemsTableColumns = useQrcodeTableColumns();

  const deleteScanItems = deleteScanItemsApi.useDeleteScanItemsMutation(
    params.orgId
  );

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
    folderId: parseAsString,
  });

  const { page, limit, searchField, searchValue, folderId } = queryState;

  // Memoize dates to prevent infinite refetch loop
  const dateRange = useMemo(
    () => ({
      fromDate: dayjs().subtract(1, "day").toISOString(),
      toDate: dayjs().toISOString(),
    }),
    []
  ); // Empty dependency array means dates are calculated only once

  // Fetch scan items from API
  const fetchScanItems = fetchScanItemsApi.useFetchScanItemsQuery({
    orgId: params.orgId,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
  });

  useEffect(() => {
    if (fetchScanItems?.data) {
      setData(fetchScanItems.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchScanItems.data]);

  const fetchScanItemsCount = fetchScanItemsApi.useFetchScanItemsCount({
    orgId: params.orgId,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
  });

  if (fetchScanItems.isError) {
    if (fetchScanItems.error?.response?.status === 403) {
      return <NoPermissionsPage errors={fetchScanItems.error} />;
    }

    throw new Error(fetchScanItems.error.message);
  }

  if (fetchScanItemsCount.isError) {
    if (fetchScanItemsCount.error?.response?.status === 403) {
      return <NoPermissionsPage errors={fetchScanItemsCount.error} />;
    }

    throw new Error(fetchScanItemsCount.error.message);
  }

  // Local state for scan items (to handle client-side delete)

  const handleDelete = async (
    rows: Row<IScanItems>[],
    callback: () => void
  ) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(t("delete.loading", "Deleting items..."));

    let successCount = 0;
    let errorCount = 0;

    // ยิงทีละอันเพื่อป้องกัน race condition และ rate limit
    for (const id of idsToDelete) {
      try {
        await deleteScanItems.mutateAsync(id);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to delete item:", error);
      }
    }

    toast.dismiss(toastId);

    const totalCount = idsToDelete.length;

    if (successCount > 0) {
      toast.success(
        `${t("delete.success", "Success")} (${successCount}/${totalCount})`
      );
    }
    if (errorCount > 0) {
      toast.error(
        `${t("delete.error", "Error")} (${errorCount}/${totalCount})`
      );
    }

    // Invalidate queries to refetch data
    await queryClient.invalidateQueries({
      queryKey: fetchScanItemsApi.fetchScanItemsKey,
      refetchType: "active",
    });

    // Clear selection after delete attempt
    callback();
  };

  const handleMoveToFolder = async (
    rows: Row<IScanItems>[],
    callback: () => void
  ) => {
    const idsToMove = rows.map((row) => row.original.id);

    if (idsToMove.length === 0) {
      console.log("idsToMove", idsToMove);
      return;
    }

    // Redirect to folders page with scanItemIds
    const scanItemIds = idsToMove.join(",");
    callback(); // Clear selection before redirect
    return router.push(
      `${RouteConfig.SCAN_ITEMS.FOLDER.LIST(
        params.orgId
      )}?scanItemIds=${scanItemIds}`
    );
  };

  const handlePageChange = (newPage: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ page: newPage });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ limit: newLimit, page: 1 }); // Reset to page 1 when changing limit
  };

  const handleSearch = (field: string, value: string) => {
    setQueryState({ searchField: field, searchValue: value, page: 1 }); // Reset to page 1 when searching
  };

  // Get total items count from API
  const totalItems = fetchScanItemsCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <QrCodeTable
        columns={scanItemsTableColumns}
        data={data}
        onDelete={handleDelete}
        onMoveToFolder={handleMoveToFolder}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={
          (fetchScanItems.isLoading && !hasLoadedBefore) ||
          isPageOrLimitChanging
        }
        folderId={folderId}
      />
    </div>
  );
};

export default ScanItemsView;
