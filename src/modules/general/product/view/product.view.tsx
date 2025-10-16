"use client";

import { useParams, useRouter } from "next/navigation";
import { fetchProductsApi, IProduct } from "../api/fetch-products.api";
import { ProductTable } from "../components/product-table/product.table";
import { getProductTableColumns } from "../components/product-table/product-columns.table";
import { useQueryStates, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Row } from "@tanstack/react-table";
import { deleteProductApi } from "../api/delete-product.api";
import { useTranslation } from "react-i18next";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { AttachScanItemToProductApi } from "../api/attach-scan-item-to-product.api";

const ProductView = () => {
  const { t } = useTranslation();
  const { t: tProduct } = useTranslation("product");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [data, setData] = useState<IProduct[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [scanItemId] = useQueryState("scanItemId");

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

  const [AttachConfirmationDialog, confirmAttach] = useConfirm({
    title: tProduct("product.attach.title"),
    message: tProduct("product.attach.message"),
    variant: "default",
  });

  const deleteProduct = deleteProductApi.useMutation();
  const attachScanItemToProduct = AttachScanItemToProductApi.useMutation();

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
              toast.error(data.description || tProduct("product.messages.deleteError"));
            }

            successCount++;
          },
          onError: () => {
            errorCount++;
            toast.error(tProduct("product.messages.deleteError"));
          },
        }
      );

      if (successCount > 0) {
        toast.success(
          `${tProduct("product.messages.deleteSuccess")} (${successCount}/${idsToDelete.length})`
        );
      }
      if (errorCount > 0) {
        toast.error(
          `${tProduct("product.messages.deleteError")} (${errorCount}/${idsToDelete.length})`
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

  const handleAttach = async (rows: Row<IProduct>[], callback: () => void) => {
    if (!scanItemId || rows.length !== 1) return;

    const ok = await confirmAttach();

    if (!ok) return;

    const productId = rows[0].original.id;

    await attachScanItemToProduct.mutateAsync(
      {
        orgId: params.orgId,
        scanItemId: scanItemId,
        productId: productId,
      },
      {
        onSuccess: ({ data }) => {
          if (data.status === "OK") {
            toast.success(data.description || "Attached successfully");
            callback();
            router.back();
          } else {
            toast.error(data.description || "Failed to attach");
          }
        },
        onError: (error) => {
          toast.error(error.message || "Failed to attach");
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

  if (fetchProducts.isError) {
    throw new Error(fetchProducts.error.message);
  }

  // Get total items count from API
  const totalItems = fetchProductsCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <AttachConfirmationDialog />
      <ProductTable
        columns={getProductTableColumns(tProduct)}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={fetchProducts.isLoading && !hasLoadedBefore}
        scanItemId={scanItemId}
        onAttach={scanItemId ? handleAttach : undefined}
      />
    </div>
  );
};

export default ProductView;
