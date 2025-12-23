"use client";

import { useParams } from "next/navigation";
import { ScanItemsFolderTable } from "../components/scan-items-folder-table/scan-items-folder.table";
import { useScanItemsFolderTableColumns } from "../components/scan-items-folder-table/scan-items-folder-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import {
  useGetScanItemFolders,
  useGetScanItemFolderCount,
  useDeleteScanItemFolder,
} from "../hooks/scan-items-hooks";
import { IScanItemsFolder } from "../api/scan-items-service";
import { getScanItemFolders } from "../api/scan-items-service";
import { useMoveScanItemToFolder } from "../hooks/scan-items-hooks";
import { useRouter } from "next/navigation";
import { useBatchOperation } from "@/hooks/use-batch-operation";
import { BatchOperationModal } from "@/components/ui/batch-operation-modal";

const ScanItemsFolderViewPage = () => {
  const { t } = useTranslation(["scan-items-folder", "common"]);
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IScanItemsFolder[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });
  const [AttachConfirmationDialog, confirmAttach] = useConfirm({
    title: t("attachmentMode.confirmTitle", "Confirm Move"),
    message: t(
      "attachmentMode.confirmMessage",
      "Are you sure you want to move the selected scan items to this folder?"
    ),
    variant: "default",
  });
  const queryClient = useQueryClient();

  const scanItemsFolderTableColumns = useScanItemsFolderTableColumns();

  const deleteScanItemFolder = useDeleteScanItemFolder();
  const moveScanItemToFolder = useMoveScanItemToFolder();
  const batchOp = useBatchOperation();

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
    scanItemIds: parseAsString,
  });

  const { page, limit, searchField, searchValue, scanItemIds } = queryState;
  const router = useRouter();

  // Memoize dates to prevent infinite refetch loop
  const dateRange = useMemo(
    () => ({
      fromDate: dayjs().subtract(1, "day").toISOString(),
      toDate: dayjs().toISOString(),
    }),
    []
  );

  // Fetch scan items folders from API
  const fetchScanItemFolders = useGetScanItemFolders(
    { orgId: params.orgId },
    {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    }
  );

  useEffect(() => {
    if (fetchScanItemFolders.data?.data) {
      setData(fetchScanItemFolders.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchScanItemFolders.data]);

  const fetchScanItemFoldersCount = useGetScanItemFolderCount(
    { orgId: params.orgId },
    {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    }
  );

  if (fetchScanItemFolders.isError) {
    if (fetchScanItemFolders.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetScanItemFolders" />;
    }
    throw new Error(fetchScanItemFolders.error.message);
  }

  if (fetchScanItemFoldersCount.isError) {
    if (fetchScanItemFoldersCount.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetScanItemFolderCount" />;
    }
    throw new Error(fetchScanItemFoldersCount.error.message);
  }

  const handleDelete = async (
    rows: Row<IScanItemsFolder>[],
    callback: () => void
  ) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(t("common:delete.loading"));

    let successCount = 0;
    let errorCount = 0;

    // ยิงทีละอันเพื่อป้องกัน race condition และ rate limit
    for (const scanItemActionId of idsToDelete) {
      try {
        await deleteScanItemFolder.mutateAsync({
          params: {
            orgId: params.orgId,
            scanItemActionId: scanItemActionId,
          },
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to delete scan item folder:", error);
      }
    }

    toast.dismiss(toastId);

    const totalCount = idsToDelete.length;

    if (successCount > 0) {
      toast.success(
        `${t("action.delete.success")} (${successCount}/${totalCount})`
      );
    }
    if (errorCount > 0) {
      toast.error(`${t("action.delete.error")} (${errorCount}/${totalCount})`);
    }

    await queryClient.invalidateQueries({
      queryKey: getScanItemFolders.key,
      refetchType: "active",
    });

    callback();
  };

  const handleAttach = async (
    rows: Row<IScanItemsFolder>[],
    callback: () => void
  ) => {
    if (!scanItemIds) {
      toast.error(t("attachmentMode.noItems", "No scan items selected"));
      return;
    }

    if (rows.length === 0) {
      toast.error(t("attachmentMode.noFolder", "Please select a folder"));
      return;
    }

    // Show confirmation dialog
    const ok = await confirmAttach();
    if (!ok) return;

    const folderId = rows[0].original.id;
    const itemIds = scanItemIds.split(",");

    await batchOp.execute({
      items: itemIds,
      operation: async (scanItemId) => {
        await moveScanItemToFolder.mutateAsync({
          params: {
            orgId: params.orgId,
            scanItemId: scanItemId,
            folderId: folderId,
          },
        });
      },
      onComplete: async () => {
        // await queryClient.invalidateQueries({
        //   queryKey: getScanItemFolders.key,
        //   refetchType: "active",
        // });
        callback();
      },
      getItemId: (id) => id,
    });
  };

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
  const totalItems = fetchScanItemFoldersCount.data?.data ?? 0;

  // Attachment mode configuration
  const attachmentMode = scanItemIds
    ? {
        title: t("attachmentMode.title", "Move Scan Items to Folder"),
        description: t(
          "attachmentMode.description",
          `Select a folder to move ${
            scanItemIds.split(",").length
          } scan item(s)`
        ),
        onBack: () => router.back(),
      }
    : undefined;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <AttachConfirmationDialog />
      <BatchOperationModal
        {...batchOp.state}
        onCancel={batchOp.cancel}
        onComplete={batchOp.close}
        messages={{
          title: t("moveProgress.title"),
          completed: t("moveProgress.completed"),
          processing: t("moveProgress.moving"),
          processed: t("moveProgress.moved"),
          allSuccess: t("moveProgress.allSuccess"),
          partialSuccess: t("moveProgress.partialSuccess"),
        }}
      />
      <ScanItemsFolderTable
        columns={scanItemsFolderTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={
          (fetchScanItemFolders.isLoading && !hasLoadedBefore) ||
          isPageOrLimitChanging
        }
        scanItemIds={scanItemIds}
        onAttach={scanItemIds ? handleAttach : undefined}
        attachmentMode={attachmentMode}
      />
    </div>
  );
};

export default ScanItemsFolderViewPage;
