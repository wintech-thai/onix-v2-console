"use client";

import { useParams } from "next/navigation";
import { fetchPrivilegesApi, IPrivileges } from "../api/fetch-privileges.api";
import { PrivilegesTable } from "../components/privileges-table/privileges.table";
import { usePrivilegesTableColumns } from "../components/privileges-table/privileges-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { deletePrivilegesApi } from "../api/delete-privileges.api";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const PrivilegesViewPage = () => {
  const { t } = useTranslation(["privileges", "common"]);
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IPrivileges[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });
  const queryClient = useQueryClient();

  const privilegesTableColumns = usePrivilegesTableColumns();

  const deletePrivileges = deletePrivilegesApi.useDeletePrivileges();

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

  // Fetch privileges from API
  const fetchPrivileges = fetchPrivilegesApi.useFetchPrivileges({
    orgId: params.orgId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
      itemType: 0,
    },
  });

  useEffect(() => {
    if (fetchPrivileges.data?.data) {
      setData(fetchPrivileges.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchPrivileges.data]);

  const fetchPrivilegesCount = fetchPrivilegesApi.useFetchPrivilegesCount({
    orgId: params.orgId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
      itemType: 0,
    },
  });

  if (fetchPrivileges.isError) {
    if (fetchPrivileges.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetPrivileges" />;
    }
    throw new Error(fetchPrivileges.error.message);
  }

  if (fetchPrivilegesCount.isError) {
    if (fetchPrivilegesCount.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetPrivilegeCount" />;
    }
    throw new Error(fetchPrivilegesCount.error.message);
  }

  const handleDelete = async (rows: Row<IPrivileges>[], callback: () => void) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(t("common:common.loading"));

    const results = await Promise.allSettled(
      idsToDelete.map((privilegeId) =>
        deletePrivileges.mutateAsync({
          orgId: params.orgId,
          privilegeId: privilegeId,
        })
      )
    );

    toast.dismiss(toastId);

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const errorCount = results.filter((r) => r.status === "rejected").length;
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
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Failed to delete privilege:", result.reason);
        }
      });
    }

    await queryClient.invalidateQueries({
      queryKey: fetchPrivilegesApi.key,
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
  const totalItems = fetchPrivilegesCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <PrivilegesTable
        columns={privilegesTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={(fetchPrivileges.isLoading && !hasLoadedBefore) || isPageOrLimitChanging}
      />
    </div>
  );
};

export default PrivilegesViewPage;
