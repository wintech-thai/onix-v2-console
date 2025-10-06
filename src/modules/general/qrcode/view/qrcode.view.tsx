"use client";

import { useParams } from "next/navigation";
import { fetchScanItemsApi, IScanItems } from "../api/fetch-qrcodes.api";
import { QrCodeTable } from "../components/qrcode-table/qrcode.table";
import { useQrcodeTableColumns } from "../components/qrcode-table/qrcode-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteScanItemsApi } from "../api/delete-scan-items";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

const ScanItemsView = () => {
  const { t } = useTranslation();
  const params = useParams<{ orgId: string }>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("qrcode.delete.title"),
    message: t("qrcode.delete.message"),
    variant: "destructive",
  });
  const queryClient = useQueryClient();

  const scanItemsTableColumns = useQrcodeTableColumns();

  const deleteScanItems = deleteScanItemsApi.useDeleteScanItemsMutation(params.orgId);

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
  });

  const { page, limit, searchField, searchValue } = queryState;

  // Memoize dates to prevent infinite refetch loop
  const dateRange = useMemo(() => ({
    fromDate: dayjs().subtract(1, 'day').toISOString(),
    toDate: dayjs().toISOString(),
  }), []); // Empty dependency array means dates are calculated only once

  // Fetch scan items from API
  const fetchScanItems = fetchScanItemsApi.useFetchScanItemsQuery({
    orgId: params.orgId,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
  });

  const fetchScanItemsCount = fetchScanItemsApi.useFetchScanItemsCount({
    orgId: params.orgId,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
  });

  if (fetchScanItems.isError) {
    throw new Error(fetchScanItems.error.message);
  }

  if (fetchScanItemsCount.isError) {
    throw new Error(fetchScanItemsCount.error.message);
  }

  // Local state for scan items (to handle client-side delete)

  const handleDelete = async (rows: Row<IScanItems>[], callback: () => void) => {
    const ok = await confirmDelete();

    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);
    let successCount = 0;
    let errorCount = 0;

    // Delete items one by one
    setIsDeleting(true);
    for (const id of idsToDelete) {
      try {
        await deleteScanItems.mutateAsync(id);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error deleting QR code with ID: ${id}`, error);
      }
    }
    setIsDeleting(false);

    // Show summary toast
    if (successCount > 0) {
      toast.success(`${t("qrcode.delete.success")} (${successCount}/${idsToDelete.length})`);
    }
    if (errorCount > 0) {
      toast.error(`${t("qrcode.delete.error")} (${errorCount}/${idsToDelete.length})`);
    }

    // Clear selection after delete attempt
    callback();

    // Invalidate queries using prefix matching - will invalidate all queries starting with these keys
    queryClient.invalidateQueries({
      queryKey: fetchScanItemsApi.fetchScanItemsKey,
      refetchType: 'active'
    });
  };

  const handlePageChange = (newPage: number) => {
    setQueryState({ page: newPage });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setQueryState({ limit: newLimit, page: 1 }); // Reset to page 1 when changing limit
  };

  const handleSearch = (field: string, value: string) => {
    setQueryState({ searchField: field, searchValue: value, page: 1 }); // Reset to page 1 when searching
  };

  // Get scan items list data
  const scanItemsListData = fetchScanItems.data?.data ?? [];

  // Get total items count from API
  const totalItems = fetchScanItemsCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <QrCodeTable
        columns={scanItemsTableColumns}
        data={scanItemsListData}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={fetchScanItems.isLoading || isDeleting}
      />
    </div>
  );
};

export default ScanItemsView;
