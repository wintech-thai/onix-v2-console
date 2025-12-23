"use client";

import { useParams } from "next/navigation";
import {
  fetchScanItemsActionsApi,
  IScanItemsAction,
} from "../api/fetch-scan-items-actions.api";
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
import { useAttachScanItemFolderToAction } from "@/modules/scan-items/scan-items-folders/hooks/scan-items-hooks";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
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

  const [AttachFolderConfirmationDialog, confirmAttachFolder] = useConfirm({
    title: "Attach Folder to Action",
    message:
      "Are you sure you want to attach this folder to the selected action?",
    variant: "default",
  });

  const queryClient = useQueryClient();
  const router = useRouter();
  const [folderId] = useQueryState("folderId");

  const scanItemsActionTableColumns = useScanItemsActionTableColumns();

  const deleteScanItemsAction =
    deleteScanItemsActionsApi.useDeleteScanItemsActions();
  const attachFolderToAction = useAttachScanItemFolderToAction();

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
  const fetchScanItemsActions =
    fetchScanItemsActionsApi.useFetchScanItemsActions({
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

  const fetchScanItemsActionsCount =
    fetchScanItemsActionsApi.useFetchScanItemsActionsCount({
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
      return <NoPermissionsPage apiName="GetScanItemActions" />;
    }
    throw new Error(fetchScanItemsActions.error.message);
  }

  if (fetchScanItemsActionsCount.isError) {
    if (fetchScanItemsActionsCount.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetScanItemActionsCount" />;
    }
    throw new Error(fetchScanItemsActionsCount.error.message);
  }

  const handleDelete = async (
    rows: Row<IScanItemsAction>[],
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
    for (const actionId of idsToDelete) {
      try {
        await deleteScanItemsAction.mutateAsync({
          orgId: params.orgId,
          scanItemsActionId: actionId,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to delete scan items action:", error);
      }
    }

    toast.dismiss(toastId);

    const totalCount = idsToDelete.length;

    if (successCount > 0) {
      toast.success(
        `${t(
          "action.delete.success",
          "Success"
        )} (${successCount}/${totalCount})`
      );
    }
    if (errorCount > 0) {
      toast.error(
        `${t("action.delete.error", "Error")} (${errorCount}/${totalCount})`
      );
    }

    await queryClient.invalidateQueries({
      queryKey: fetchScanItemsActionsApi.key,
      refetchType: "active",
    });

    callback();
  };

  const handleAttach = async (
    rows: Row<IScanItemsAction>[],
    callback: () => void
  ) => {
    if (!folderId || rows.length !== 1) return;

    const ok = await confirmAttachFolder();

    if (!ok) return;

    const actionId = rows[0].original.id;
    const toastId = toast.loading(
      t("attach.loading", "Attaching folder to action...")
    );

    try {
      const result = await attachFolderToAction.mutateAsync({
        params: {
          orgId: params.orgId,
          folderId: folderId,
          actionId: actionId,
        },
      });

      if (result.data.status === "OK" || result.data.status === "SUCCESS") {
        toast.success(
          result.data.description ||
            t("attach.success", "Folder attached successfully"),
          { id: toastId }
        );
        callback();
        router.back();
      } else {
        toast.error(
          result.data.description ||
            t("attach.error", "Failed to attach folder"),
          {
            id: toastId,
          }
        );
      }
    } catch {
      toast.dismiss(toastId);
    }
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

  // Determine attachment mode
  const attachmentId = folderId;
  const attachmentMode = folderId
    ? {
        title: t("attach.mode.title", "Attach Folder Mode"),
        description: t(
          "attach.mode.description",
          "Select an action to attach the folder. You can only select one action at a time."
        ),
      }
    : undefined;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <AttachFolderConfirmationDialog />
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
        isLoading={
          (fetchScanItemsActions.isLoading && !hasLoadedBefore) ||
          isPageOrLimitChanging
        }
        attachmentId={attachmentId}
        onAttach={attachmentId ? handleAttach : undefined}
        attachmentMode={attachmentMode}
      />
    </div>
  );
};

export default ScanItemsActionViewPage;
