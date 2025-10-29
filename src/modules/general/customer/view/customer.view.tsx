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

const CustomerView = () => {
  const { t } = useTranslation("customer");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const [data, setData] = useState<ICustomer[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
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
    throw new Error(fetchCustomer.error.message);
  }

  if (fetchCustomerCount.isError) {
    throw new Error(fetchCustomerCount.error.message);
  }

  const handleDelete = async (rows: Row<ICustomer>[], callback: () => void) => {
    const ok = await confirmDelete();

    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);
    let successCount = 0;
    let errorCount = 0;

    // Delete items one by one
    for (const id of idsToDelete) {
      await deleteCustomer.mutateAsync(
        {
          orgId: params.orgId,
          customerId: id,
        },
        {
          onSuccess: ({ data }) => {
            if (data.status !== "OK") {
              errorCount++;
              toast.error(data.description);
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

    // Show summary toast
    if (successCount > 0) {
      toast.success(`${t("delete.success")} (${successCount}/${idsToDelete.length})`);
    }
    if (errorCount > 0) {
      toast.error(`${t("delete.error")} (${errorCount}/${idsToDelete.length})`);
    }

    // Invalidate queries using prefix matching - will invalidate all queries starting with these keys
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

    await attachScanItemToCustomer.mutateAsync(
      {
        orgId: params.orgId,
        scanItemId: scanItemId,
        customerId: customerId,
      },
      {
        onSuccess: ({ data }) => {
          if (data.status === "OK" || data.status === "SUCCESS") {
            toast.success(data.description || t("attach.success"));
            callback();
            router.back();
          } else {
            toast.error(data.description || t("attach.error"));
          }
        },
        onError: (error) => {
          toast.error(error.message || t("attach.error"));
        },
      }
    );
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
  const totalItems =
    typeof fetchCustomer.data?.data === "number" ? fetchCustomer.data.data : 0;

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
        isLoading={fetchCustomer.isLoading && !hasLoadedBefore}
        scanItemId={scanItemId}
        onAttach={scanItemId ? handleAttach : undefined}
      />
    </div>
  );
};

export default CustomerView;
