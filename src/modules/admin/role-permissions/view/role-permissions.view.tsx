"use client";

import { useParams } from "next/navigation";
import { RolePermissionsTable } from "../components/role-permissions-table/role-permissions.table";
import { useRolePermissionsTableColumns } from "../components/role-permissions-table/role-permissions-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCustomRoles,
  useGetCustomRoleCount,
  useDeleteCustomRoleById,
} from "../hooks/role-permissions-hooks";
import {
  IRolePermissions,
  getCustomRoles,
} from "../api/role-permissions.service";

const RolePermissionsViewPage = () => {
  const { t } = useTranslation(["role-permissions", "common"]);
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();
  const [data, setData] = useState<IRolePermissions[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);

  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });

  const rolePermissionsTableColumns = useRolePermissionsTableColumns();
  const deleteCustomRole = useDeleteCustomRoleById();

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

  // Fetch custom roles from API
  const fetchCustomRoles = useGetCustomRoles(
    { orgId: params.orgId },
    {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
      level: "",
    }
  );

  useEffect(() => {
    if (fetchCustomRoles.data?.data) {
      setData(fetchCustomRoles.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchCustomRoles.data]);

  const fetchCustomRoleCount = useGetCustomRoleCount(
    { orgId: params.orgId },
    {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
      level: "",
    }
  );

  if (fetchCustomRoles.isError) {
    if (fetchCustomRoles.error?.response?.status === 403) {
      return <NoPermissionsPage errors={fetchCustomRoles.error} />;
    }
    throw new Error(fetchCustomRoles.error.message);
  }

  if (fetchCustomRoleCount.isError) {
    if (fetchCustomRoleCount.error?.response?.status === 403) {
      return <NoPermissionsPage errors={fetchCustomRoleCount.error} />;
    }
    throw new Error(fetchCustomRoleCount.error.message);
  }

  const handleDelete = async (
    rows: Row<IRolePermissions>[],
    callback: () => void
  ) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.roleId);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(t("common:delete.loading"));

    let successCount = 0;
    let errorCount = 0;

    // Delete one by one to prevent race condition and rate limit
    for (const id of idsToDelete) {
      try {
        await deleteCustomRole.mutateAsync({
          params: {
            id: id,
            orgId: params.orgId,
          },
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to delete role:", error);
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
      queryKey: getCustomRoles.key,
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
  const totalItems = fetchCustomRoleCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <RolePermissionsTable
        columns={rolePermissionsTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={
          (fetchCustomRoles.isLoading && !hasLoadedBefore) ||
          isPageOrLimitChanging
        }
      />
    </div>
  );
};

export default RolePermissionsViewPage;
