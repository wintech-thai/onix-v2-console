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
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const ProductView = () => {
  const { t } = useTranslation(["scan-item", "common", "product"]);
  const { t: productLang } = useTranslation("product");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [data, setData] = useState<IProduct[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [scanItemId] = useQueryState("scanItemId");

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
  });

  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("scan-item:delete.title"),
    message: t("scan-item:delete.message"),
    variant: "destructive",
  });

  const [AttachConfirmationDialog, confirmAttach] = useConfirm({
    title: t("product:attach.title"),
    message: t("product:attach.message"),
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
      setIsPageOrLimitChanging(false);
    }
  }, [fetchProducts.data]);

  const handleDelete = async (rows: Row<IProduct>[], callback: () => void) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(
      t("common:delete.loading", "Deleting items...")
    );

    const results = await Promise.allSettled(
      idsToDelete.map((id) =>
        deleteProduct.mutateAsync({
          orgId: params.orgId,
          productId: id,
        })
      )
    );

    toast.dismiss(toastId);

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const errorCount = results.filter((r) => r.status === "rejected").length;
    const totalCount = idsToDelete.length;

    if (successCount > 0) {
      toast.success(
        `${t("product:messages.deleteSuccess", "Success")} (${successCount}/${totalCount})`
      );
    }
    if (errorCount > 0) {
      toast.error(
        `${t("product:messages.deleteError", "Error")} (${errorCount}/${totalCount})`
      );
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Failed to delete product:", result.reason);
        }
      });
    }

    await queryClient.invalidateQueries({
      queryKey: fetchProductsApi.fetchProductKey,
      refetchType: "active",
    });

    callback();
  };

  const handleAttach = async (rows: Row<IProduct>[], callback: () => void) => {
    if (!scanItemId || rows.length !== 1) return;

    const ok = await confirmAttach();

    if (!ok) return;

    const productId = rows[0].original.id;
    const toastId = toast.loading(t("product:attach.loading"));

    try {
      const result = await attachScanItemToProduct.mutateAsync({
        orgId: params.orgId,
        scanItemId: scanItemId,
        productId: productId,
      });

      if (result.data.status === "OK" || result.data.status === "SUCCESS") {
        toast.success(result.data.description || "Attached successfully", { id: toastId });
        callback();
        router.back();
      } else {
        toast.error(result.data.description || "Failed to attach", { id: toastId });
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

  if (fetchProducts.isError) {
    if (fetchProducts.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetItems" />
    }
    throw new Error(fetchProducts.error.message);
  }

  if (fetchProductsCount.isError) {
    if (fetchProductsCount.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetItemCount" />
    }
    throw new Error(fetchProductsCount.error.message);
  }

  // Get total items count from API
  const totalItems = fetchProductsCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <AttachConfirmationDialog />
      <ProductTable
        columns={getProductTableColumns(productLang)}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={(fetchProducts.isLoading && !hasLoadedBefore) || isPageOrLimitChanging}
        scanItemId={scanItemId}
        onAttach={scanItemId ? handleAttach : undefined}
      />
    </div>
  );
};

export default ProductView;
