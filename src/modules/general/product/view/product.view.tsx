"use client";

import { useParams } from "next/navigation";
import { fetchProductsApi, IProduct } from "../api/fetch-products.api";
import { ProductTable } from "../components/product-table/product.table";
import { productTableColumns } from "../components/product-table/product-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { deleteProductApi } from "../api/delete-product.api";
import { useTranslation } from "react-i18next";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

const ProductView = () => {
  const { t } = useTranslation();
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();
  const [data, setData] = useState<IProduct[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
  });

  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("qrcode.delete.title"),
    message: t("qrcode.delete.message"),
    variant: "destructive",
  });

  const deleteProduct = deleteProductApi.useMutation();

  const { page, limit, searchField, searchValue } = queryState;

  const dateRange = useMemo(
    () => ({
      fromDate: dayjs().subtract(1, "day").toISOString(),
      toDate: dayjs().toISOString(),
    }),
    []
  ); // Empty dependency array means dates are calculated only once

  // Fetch products from API
  const fetchProducts = fetchProductsApi.useFetchProductQuery({
    orgId: params.orgId,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    itemType: 1,
  });

  const fetchProductsCount = fetchProductsApi.useFetchProductCount({
    orgId: params.orgId,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    itemType: 1,
  });

  useEffect(() => {
    if (fetchProducts.data?.data) {
      setData(fetchProducts.data.data);
      setHasLoadedBefore(true);
    }
  }, [fetchProducts.data]);

  const handleDelete = async (rows: Row<IProduct>[], callback: () => void) => {
    const ok = await confirmDelete();

    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);
    let successCount = 0;
    let errorCount = 0;

    for (const id of idsToDelete) {
      await deleteProduct.mutateAsync(
        {
          orgId: params.orgId,
          productId: id,
        },
        {
          onSuccess: ({ data }) => {
            if (data.status !== "OK") {
              errorCount++;
              toast.error(data.description || t("qrcode.delete.error"));
            }

            successCount++;
          },
          onError: () => {
            errorCount++;
            toast.error(t("qrcode.delete.error"));
          },
        }
      );

      if (successCount > 0) {
        toast.success(
          `${t("qrcode.delete.success")} (${successCount}/${idsToDelete.length})`
        );
      }
      if (errorCount > 0) {
        toast.error(
          `${t("qrcode.delete.error")} (${errorCount}/${idsToDelete.length})`
        );
      }

      // Invalidate queries using prefix matching - will invalidate all queries starting with these keys
      await queryClient.invalidateQueries({
        queryKey: fetchProductsApi.fetchProductKey,
        refetchType: "active",
      });

      // Clear selection after delete attempt
      callback();
    }
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

  if (fetchProducts.isError) {
    throw new Error(fetchProducts.error.message);
  }

  // Get total items count from API
  const totalItems = fetchProductsCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <ProductTable
        columns={productTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={fetchProducts.isLoading && !hasLoadedBefore}
      />
    </div>
  );
};

export default ProductView;
