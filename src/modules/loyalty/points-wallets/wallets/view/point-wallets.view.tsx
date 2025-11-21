"use client";

import { useParams } from "next/navigation";
import { fetchWalletsApi, IWallets } from "../api/fetch-wallets.api";
import { WalletsTable } from "../components/wallets-table/wallets-table";
import { useWalletsTableColumns } from "../components/wallets-table/wallets-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteWalletApi } from "../api/delete-wallets.api";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { WalletsModal } from "../components/wallets-modal/wallets-modal";

const PointWalletsViewPage = () => {
  const { t } = useTranslation(["wallets", "common"]);
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IWallets[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const deleteWallet = deleteWalletApi.useDeleteWallet();

  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });

  const handleEdit = (id: string) => {
    setSelectedWalletId(id);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedWalletId(null);
    setIsModalOpen(true);
  };

  const walletsTableColumns = useWalletsTableColumns(handleEdit);

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

  // Fetch Wallets from API
  const fetchWallets = fetchWalletsApi.useFetchWallets({
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
    if (fetchWallets.data?.data) {
      setData(fetchWallets.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchWallets.data]);

  const fetchWalletsCount = fetchWalletsApi.useFetchWalletsCount({
    orgId: params.orgId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    },
  });

  if (fetchWallets.isError) {
    if (fetchWallets.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetWallets" />;
    }
    throw new Error(fetchWallets.error.message);
  }

  if (fetchWalletsCount.isError) {
    if (fetchWalletsCount.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetWalletsCount" />;
    }
    throw new Error(fetchWalletsCount.error.message);
  }

  const handleDelete = async (rows: Row<IWallets>[], callback: () => void) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(t("delete.loading"));

    const results = await Promise.allSettled(
      idsToDelete.map((walletId) =>
        deleteWallet.mutateAsync({
          orgId: params.orgId,
          walletId: walletId,
        })
      )
    );

    toast.dismiss(toastId);

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const errorCount = results.filter((r) => r.status === "rejected").length;
    const totalCount = idsToDelete.length;

    if (successCount > 0) {
      toast.success(`${t("delete.success")} (${successCount}/${totalCount})`);
    }
    if (errorCount > 0) {
      toast.error(`${t("delete.error")} (${errorCount}/${totalCount})`);
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Failed to delete wallet:", result.reason);
        }
      });
    }

    await queryClient.invalidateQueries({
      queryKey: [fetchWalletsApi.key],
    });

    callback();
  };

  const handleSearch = (field: string, value: string) => {
    setQueryState({ searchField: field, searchValue: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ page: newPage });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ limit: newLimit, page: 1 }); // Reset to page 1 when changing limit
  };

  // Get total items count from API
  const totalItems = fetchWalletsCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <WalletsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        walletId={selectedWalletId}
      />
      <WalletsTable
        columns={walletsTableColumns}
        data={data}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        onDelete={handleDelete}
        onAdd={handleAdd}
        isLoading={
          (fetchWallets.isLoading && !hasLoadedBefore) || isPageOrLimitChanging
        }
      />
    </div>
  );
};

export default PointWalletsViewPage;
