"use client";

import { useParams, useRouter } from "next/navigation";
import { fetchProductsApi, IProduct } from "../api/fetch-products.api";
import { ProductTable } from "../components/product-table/product.table";
import { getProductTableColumns } from "../components/product-table/product-columns.table";
import {
  useQueryStates,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import { Row } from "@tanstack/react-table";
import { deleteProductApi } from "../api/delete-product.api";
import { useTranslation } from "react-i18next";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { AttachScanItemToProductApi } from "../api/attach-scan-item-to-product.api";
import { useAttachScanItemFolderToProduct } from "@/modules/scan-items/scan-items-folders/hooks/scan-items-hooks";
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
  const [folderId] = useQueryState("folderId");

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

  const [AttachFolderConfirmationDialog, confirmAttachFolder] = useConfirm({
    title: "Attach Folder to Product",
    message:
      "Are you sure you want to attach this folder to the selected product?",
    variant: "default",
  });

  const deleteProduct = deleteProductApi.useMutation();
  const attachScanItemToProduct = AttachScanItemToProductApi.useMutation();
  const attachFolderToProduct = useAttachScanItemFolderToProduct();

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

    let successCount = 0;
    let errorCount = 0;

    // ยิงทีละอันเพื่อป้องกัน race condition และ rate limit
    for (const id of idsToDelete) {
      try {
        await deleteProduct.mutateAsync({
          orgId: params.orgId,
          productId: id,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to delete product:", error);
      }
    }

    toast.dismiss(toastId);

    const totalCount = idsToDelete.length;

    if (successCount > 0) {
      toast.success(
        `${t(
          "product:messages.deleteSuccess",
          "Success"
        )} (${successCount}/${totalCount})`
      );
    }
    if (errorCount > 0) {
      toast.error(
        `${t(
          "product:messages.deleteError",
          "Error"
        )} (${errorCount}/${totalCount})`
      );
    }

    await queryClient.invalidateQueries({
      queryKey: fetchProductsApi.fetchProductKey,
      refetchType: "active",
    });

    callback();
  };

  const handleAttach = async (rows: Row<IProduct>[], callback: () => void) => {
    const isScanItem = !!scanItemId;
    const isFolder = !!folderId;

    if ((!isScanItem && !isFolder) || rows.length !== 1) return;

    const ok = isScanItem ? await confirmAttach() : await confirmAttachFolder();

    if (!ok) return;

    const productId = rows[0].original.id;
    const toastId = toast.loading(
      isScanItem
        ? t("product:attach.loading")
        : "Attaching folder to product..."
    );

    try {
      const result = isScanItem
        ? await attachScanItemToProduct.mutateAsync({
            orgId: params.orgId,
            scanItemId: scanItemId!,
            productId: productId,
          })
        : await attachFolderToProduct.mutateAsync({
            params: {
              orgId: params.orgId,
              folderId: folderId!,
              productId: productId,
            },
          });

      if (result.data.status === "OK" || result.data.status === "SUCCESS") {
        toast.success(
          result.data.description ||
            (isScanItem
              ? "Attached successfully"
              : "Folder attached successfully"),
          { id: toastId }
        );
        callback();
        router.back();
      } else {
        toast.error(
          result.data.description ||
            (isScanItem ? "Failed to attach" : "Failed to attach folder"),
          { id: toastId }
        );
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
      return <NoPermissionsPage errors={fetchProducts.error} />;
    }
    throw new Error(fetchProducts.error.message);
  }

  if (fetchProductsCount.isError) {
    if (fetchProductsCount.error?.response?.status === 403) {
      return <NoPermissionsPage errors={fetchProductsCount.error} />;
    }
    throw new Error(fetchProductsCount.error.message);
  }

  // Get total items count from API
  const totalItems = fetchProductsCount.data?.data ?? 0;

  // Determine attachment mode
  const attachmentId = scanItemId || folderId;
  const attachmentMode = attachmentId
    ? {
        title: t("product:attach.mode.title"),
        description: t("product:attach.mode.description"),
      }
    : undefined;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <AttachConfirmationDialog />
      <AttachFolderConfirmationDialog />
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
        isLoading={
          (fetchProducts.isLoading && !hasLoadedBefore) || isPageOrLimitChanging
        }
        attachmentId={attachmentId}
        onAttach={attachmentId ? handleAttach : undefined}
        attachmentMode={attachmentMode}
      />
    </div>
  );
};

export default ProductView;
