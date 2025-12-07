"use client";

import { useParams } from "next/navigation";
import { fetchVoucherApi, IVoucher } from "../api/fetch-vouchers.api";
import { VoucherTable } from "../components/voucher-table/voucher.table";
import { useVoucherTableColumns } from "../components/voucher-table/voucher-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteVoucherApi } from "../api/delete-vouchers.api";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const VoucherViewPage = () => {
  const { t } = useTranslation(["voucher", "common"]);
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IVoucher[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });
  const queryClient = useQueryClient();

  const voucherTableColumns = useVoucherTableColumns();

  const deleteVoucher = deleteVoucherApi.useDeleteVoucher();

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
      fromDate: dayjs().subtract(1, "year").toISOString(),
      toDate: dayjs().toISOString(),
    }),
    []
  );

  // Fetch vouchers from API
  const fetchVouchers = fetchVoucherApi.useFetchVouchers({
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
    if (fetchVouchers.data?.data) {
      setData(fetchVouchers.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchVouchers.data]);

  const fetchVouchersCount = fetchVoucherApi.useFetchVouchersCount({
    orgId: params.orgId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    },
  });

  if (fetchVouchers.isError) {
    if (fetchVouchers.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetVouchers" />;
    }
    throw new Error(fetchVouchers.error.message);
  }

  if (fetchVouchersCount.isError) {
    if (fetchVouchersCount.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetVoucherCount" />;
    }
    throw new Error(fetchVouchersCount.error.message);
  }

  const handleDelete = async (rows: Row<IVoucher>[], callback: () => void) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(t("common:delete.loading"));

    const results = await Promise.allSettled(
      idsToDelete.map((voucherId) =>
        deleteVoucher.mutateAsync({
          orgId: params.orgId,
          voucherId: voucherId,
        })
      )
    );

    toast.dismiss(toastId);

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const errorCount = results.filter((r) => r.status === "rejected").length;
    const totalCount = idsToDelete.length;

    if (successCount > 0) {
      toast.success(
        `${t("delete.success")} (${successCount}/${totalCount})`
      );
    }
    if (errorCount > 0) {
      toast.error(
        `${t("delete.error")} (${errorCount}/${totalCount})`
      );
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Failed to delete voucher:", result.reason);
        }
      });
    }

    await queryClient.invalidateQueries({
      queryKey: [fetchVoucherApi.key],
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

  const totalItems = fetchVouchersCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <VoucherTable
        columns={voucherTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={(fetchVouchers.isLoading && !hasLoadedBefore) || isPageOrLimitChanging}
      />
    </div>
  );
};

export default VoucherViewPage;
