"use client";

import { useParams } from "next/navigation";
import { fetchApiKeyApi, IApiKey } from "../api/fetch-apikey.api";
import { ApiKeysTable } from "../components/apikeys-table/apikeys.table";
import { useApiKeyTableColumns } from "../components/apikeys-table/apikeys-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteApiKeyApi } from "../api/delete-apikey.api";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const ApiKeyView = () => {
  const { t } = useTranslation(["apikey", "common"]);
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IApiKey[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });
  const queryClient = useQueryClient();

  const apiKeyTableColumns = useApiKeyTableColumns();

  const deleteApiKey = deleteApiKeyApi.useDeleteApiKey();

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

  // Fetch API keys from API
  const fetchApiKeys = fetchApiKeyApi.useFetchApiKey({
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
    if (fetchApiKeys.data?.data) {
      setData(fetchApiKeys.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchApiKeys.data]);

  const fetchApiKeysCount = fetchApiKeyApi.useFetchApiKeyCount({
    orgId: params.orgId,
    values: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    },
  });

  if (fetchApiKeys.isError) {
    if (fetchApiKeys.error.response?.status === 403) {
      return <NoPermissionsPage errors={fetchApiKeys.error} />;
    }
    throw new Error(fetchApiKeys.error.message);
  }

  if (fetchApiKeysCount.isError) {
    if (fetchApiKeysCount.error.response?.status === 403) {
      return <NoPermissionsPage errors={fetchApiKeysCount.error} />;
    }
    throw new Error(fetchApiKeysCount.error.message);
  }

  const handleDelete = async (rows: Row<IApiKey>[], callback: () => void) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.keyId);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(t("common:delete.loading"));

    let successCount = 0;
    let errorCount = 0;

    // ยิงทีละอันเพื่อป้องกัน race condition และ rate limit
    for (const apiKeyId of idsToDelete) {
      try {
        await deleteApiKey.mutateAsync({
          orgId: params.orgId,
          apiKeyId: apiKeyId,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to delete API key:", error);
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

    await queryClient.invalidateQueries({
      queryKey: fetchApiKeyApi.key,
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
  const totalItems = fetchApiKeysCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <ApiKeysTable
        columns={apiKeyTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={
          (fetchApiKeys.isLoading && !hasLoadedBefore) || isPageOrLimitChanging
        }
      />
    </div>
  );
};

export default ApiKeyView;
