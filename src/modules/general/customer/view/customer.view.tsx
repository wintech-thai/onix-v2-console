"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchCustomerApi, ICustomer } from "../api/fetch-customer.api";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerTableColumns } from "../components/customer-table/customer-columns.table";
import { deleteCustomerApi } from "../api/delete-customer.api";
import { useQueryStates, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import dayjs from "dayjs";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { CustomerTable } from "../components/customer-table/customer.table";
import { attachScanItemToCustomerApi } from "../api/attach-scan-item-to-customer.api";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const CustomerView = () => {
  const { t } = useTranslation(["customer", "common"]);
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const [data, setData] = useState<ICustomer[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [scanItemId] = useQueryState("scanItemId");

  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });

  const [AttachConfirmationDialog, confirmAttach] = useConfirm({
    title: t("attach.title"),
    message: t("attach.message"),
    variant: "default",
  });

  const queryClient = useQueryClient();

  const customerTableColumns = useCustomerTableColumns();

  const deleteCustomer = deleteCustomerApi.useDeleteCustomer();
  const attachScanItemToCustomer = attachScanItemToCustomerApi.useMutation();

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

  const fetchCustomer = fetchCustomerApi.useFetchCustomer({
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
    if (fetchCustomer.data?.data) {
      setData(fetchCustomer.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchCustomer.data]);

  const fetchCustomerCount = fetchCustomerApi.useFetchCustomerCount({
    orgId: params.orgId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    },
  });

  if (fetchCustomer.isError) {
    if (fetchCustomer.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetCustomers" />
    }
    throw new Error(fetchCustomer.error.message);
  }

  if (fetchCustomerCount.isError) {
    if (fetchCustomerCount.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetCustomerCount" />
    }
    throw new Error(fetchCustomerCount.error.message);
  }

  const handleDelete = async (rows: Row<ICustomer>[], callback: () => void) => {
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
    for (const id of idsToDelete) {
      try {
        await deleteCustomer.mutateAsync({
          orgId: params.orgId,
          customerId: id,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to delete customer:", error);
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
      queryKey: fetchCustomerApi.key,
      refetchType: "active",
    });

    callback();
  };

  const handleAttach = async (rows: Row<ICustomer>[], callback: () => void) => {
    if (!scanItemId || rows.length !== 1) return;

    const ok = await confirmAttach();

    if (!ok) return;

    const customerId = rows[0].original.id;
    const toastId = toast.loading(t("attach.loading"));

    try {
      const result = await attachScanItemToCustomer.mutateAsync({
        orgId: params.orgId,
        scanItemId: scanItemId,
        customerId: customerId,
      });

      if (result.data.status === "OK" || result.data.status === "SUCCESS") {
        toast.success(result.data.description || t("attach.success"), { id: toastId });
        callback();
        router.back();
      } else {
        toast.error(result.data.description || t("attach.error"), { id: toastId });
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
  const totalItems = fetchCustomerCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <AttachConfirmationDialog />

      <CustomerTable
        columns={customerTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={(fetchCustomer.isLoading && !hasLoadedBefore) || isPageOrLimitChanging}
        scanItemId={scanItemId}
        onAttach={scanItemId ? handleAttach : undefined}
      />
    </div>
  );
};

export default CustomerView;
