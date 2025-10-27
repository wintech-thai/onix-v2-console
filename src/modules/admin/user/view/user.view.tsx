"use client";

import { useParams } from "next/navigation";
import { fetchUsersApi, IUser } from "../api/fetch-users.api";
import { UserTable } from "../components/user-table/user.table";
import { useUserTableColumns } from "../components/user-table/user-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteUserApi } from "../api/delete-user.api";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const UserView = () => {
  const { t } = useTranslation("user");
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IUser[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [, setIsDeleting] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });
  const queryClient = useQueryClient();

  const userTableColumns = useUserTableColumns();

  const deleteUser = deleteUserApi.useDeleteUser();

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

  // Fetch users from API
  const fetchUsers = fetchUsersApi.useFetchUsers({
    orgId: params.orgId,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
  });

  useEffect(() => {
    if (fetchUsers.data?.data) {
      setData(fetchUsers.data.data);
      setHasLoadedBefore(true);
    }
  }, [fetchUsers.data]);

  const fetchUsersCount = fetchUsersApi.useFetchUsersCount({
    orgId: params.orgId,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
  });

  if (fetchUsers.isError) {
    throw new Error(fetchUsers.error.message);
  }

  if (fetchUsersCount.isError) {
    throw new Error(fetchUsersCount.error.message);
  }

  const handleDelete = async (
    rows: Row<IUser>[],
    callback: () => void
  ) => {
    const ok = await confirmDelete();

    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.orgUserId);
    let successCount = 0;
    let errorCount = 0;

    // Delete items one by one
    setIsDeleting(true);
    for (const userId of idsToDelete) {
      await deleteUser.mutateAsync(
        {
          orgId: params.orgId,
          userId: userId,
        },
        {
          onSuccess: ({ data }) => {
            if (data.status !== "OK") {
              errorCount++;
              toast.error(data.description || t("delete.error"));
            } else {
              successCount++;
            }
          },
          onError: () => {
            errorCount++;
            toast.error(t("delete.error"));
          },
        }
      );
    }
    setIsDeleting(false);

    // Show summary toast
    if (successCount > 0) {
      toast.success(
        `${t("delete.success")} (${successCount}/${idsToDelete.length})`
      );
    }
    if (errorCount > 0) {
      toast.error(
        `${t("delete.error")} (${errorCount}/${idsToDelete.length})`
      );
    }

    // Invalidate queries using prefix matching - will invalidate all queries starting with these keys
    await queryClient.invalidateQueries({
      queryKey: fetchUsersApi.key,
      refetchType: "active",
    });

    // Clear selection after delete attempt
    callback();
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

  // Get total items count from API
  const totalItems = typeof fetchUsersCount.data?.data === "number"
    ? fetchUsersCount.data.data
    : 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <UserTable
        columns={userTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={fetchUsers.isLoading && !hasLoadedBefore}
      />
    </div>
  );
};

export default UserView;
