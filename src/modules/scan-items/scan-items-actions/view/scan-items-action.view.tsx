"use client";

import { useParams } from "next/navigation";
import { fetchScanItemsActionsApi, IScanItemsAction } from "../api/fetch-scan-items-actions.api";
import { ScanItemsActionTable } from "../components/scan-items-action-table/scan-items-action.table";
import { useScanItemsActionTableColumns } from "../components/scan-items-action-table/scan-items-action-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteScanItemsActionsApi } from "../api/delete-scan-items-actions.api";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const ScanItemsActionViewPage = () => {
  const { t } = useTranslation(["scan-items-action", "common"]);
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IScanItemsAction[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });
  const queryClient = useQueryClient();

  const scanItemsActionTableColumns = useScanItemsActionTableColumns();

  const deleteScanItemsAction = deleteScanItemsActionsApi.useDeleteScanItemsActions();

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
  ); // Empty dependency array means dates are calculated only once

  // Fetch scan items actions from API
  const fetchScanItemsActions = fetchScanItemsActionsApi.useFetchScanItemsActions({
    orgId: params.orgId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    },
  });

  useEffect(() => {
    if (fetchScanItemsActions.data?.data) {
      setData(fetchScanItemsActions.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchScanItemsActions.data]);

  const fetchScanItemsActionsCount = fetchScanItemsActionsApi.useFetchScanItemsActionsCount({
    orgId: params.orgId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    },
  });

  if (fetchScanItemsActions.isError) {
    if (fetchScanItemsActions.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetScanItemActions" />
    }
    throw new Error(fetchScanItemsActions.error.message);
  }

  if (fetchScanItemsActionsCount.isError) {
    if (fetchScanItemsActionsCount.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetScanItemActionsCount" />
    }
    throw new Error(fetchScanItemsActionsCount.error.message);
  }

  const handleDelete = async (rows: Row<IScanItemsAction>[], callback: () => void) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(t("common:delete.loading"));

    const results = await Promise.allSettled(
      idsToDelete.map((actionId) =>
        deleteScanItemsAction.mutateAsync({
          orgId: params.orgId,
          scanItemsActionId: actionId,
        })
      )
    );

    toast.dismiss(toastId);

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const errorCount = results.filter((r) => r.status === "rejected").length;
    const totalCount = idsToDelete.length;

    if (successCount > 0) {
      toast.success(
        `${t("action.delete.success", "Success")} (${successCount}/${totalCount})`
      );
    }
    if (errorCount > 0) {
      toast.error(
        `${t("action.delete.error", "Error")} (${errorCount}/${totalCount})`
      );
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Failed to delete scan item action:", result.reason);
        }
      });
    }

    await queryClient.invalidateQueries({
      queryKey: fetchScanItemsActionsApi.key,
      refetchType: "active",
    });

    callback();
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
    // ไม่ต้อง set loading เพราะ search ไม่ต้องการ loading
    setQueryState({ searchField: field, searchValue: value, page: 1 }); // Reset to page 1 when searching
  };

  // Get total items count from API
  const totalItems = fetchScanItemsActionsCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <ScanItemsActionTable
        columns={scanItemsActionTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={(fetchScanItemsActions.isLoading && !hasLoadedBefore) || isPageOrLimitChanging}
      />
    </div>
  );
};

export default ScanItemsActionViewPage;
