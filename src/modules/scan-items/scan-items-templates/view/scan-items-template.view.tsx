"use client";

import { useParams } from "next/navigation";
import { fetchScanItemsTemplatesApi, IScanItemTemplate } from "../api/fetch-scan-items-templates.api";
import { ScanItemsTemplateTable } from "../components/scan-items-template-table/scan-items-template.table";
import { useScanItemsTemplateTableColumns } from "../components/scan-items-template-table/scan-items-template-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteScanItemsTemplatesApi } from "../api/delete-scan-items-templates.api";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const ScanItemTemplateViewPage = () => {
  const { t } = useTranslation(["scan-items-template", "common"]);
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IScanItemTemplate[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });
  const queryClient = useQueryClient();

  const scanItemsTemplateTableColumns = useScanItemsTemplateTableColumns();

  const deleteScanItemsTemplate = deleteScanItemsTemplatesApi.useDeleteScanItemsTemplates();

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

  // Fetch scan items templates from API
  const fetchScanItemsTemplates = fetchScanItemsTemplatesApi.useFetchScanItemsTemplates({
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
    if (fetchScanItemsTemplates.data?.data) {
      setData(fetchScanItemsTemplates.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchScanItemsTemplates.data]);

  const fetchScanItemsTemplatesCount = fetchScanItemsTemplatesApi.useFetchScanItemsTemplatesCount({
    orgId: params.orgId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    },
  });

  if (fetchScanItemsTemplates.isError) {
    if (fetchScanItemsTemplates.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetScanItemTemplates" />
    }
    throw new Error(fetchScanItemsTemplates.error.message);
  }

  if (fetchScanItemsTemplatesCount.isError) {
    if (fetchScanItemsTemplatesCount.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetScanItemTemplateCount" />
    }
    throw new Error(fetchScanItemsTemplatesCount.error.message);
  }

  const handleDelete = async (rows: Row<IScanItemTemplate>[], callback: () => void) => {
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
    for (const templateId of idsToDelete) {
      try {
        await deleteScanItemsTemplate.mutateAsync({
          orgId: params.orgId,
          scanItemsTemplateId: templateId,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to delete scan item template:", error);
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
      toast.error(
        `${t("action.delete.error")} (${errorCount}/${totalCount})`
      );
    }

    await queryClient.invalidateQueries({
      queryKey: [fetchScanItemsTemplatesApi.key],
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
    setQueryState({ limit: newLimit, page: 1 });
  };

  const handleSearch = (field: string, value: string) => {
    setQueryState({ searchField: field, searchValue: value, page: 1 });
  };

  // Get total items count from API
  const totalItems = fetchScanItemsTemplatesCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <ScanItemsTemplateTable
        columns={scanItemsTemplateTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={(fetchScanItemsTemplates.isLoading && !hasLoadedBefore) || isPageOrLimitChanging}
      />
    </div>
  );
};

export default ScanItemTemplateViewPage;

