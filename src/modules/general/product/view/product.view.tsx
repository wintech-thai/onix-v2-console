"use client";

import { useParams } from "next/navigation";
import { fetchProductsApi, IProduct } from "../api/fetch-products.api";
import { ProductTable } from "../components/product-table/product.table";
import { productTableColumns } from "../components/product-table/product-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { useState } from "react";
import { Row } from "@tanstack/react-table";

const ProductView = () => {
  const params = useParams<{ orgId: string }>();

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
  });

  const { page, limit, searchField, searchValue } = queryState;

  // Fetch products from API
  const fetchProducts = fetchProductsApi.fetchProductQuery({
    orgId: params.orgId,
    fromDate: "",
    toDate: "",
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    itemType: 0,
  });

  const fetchProductsCount = fetchProductsApi.fetchProductCount({
    orgId: params.orgId,
    fromDate: "",
    toDate: "",
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    itemType: 0,
  });

  // Local state for products (to handle client-side delete)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const handleDelete = (rows: Row<IProduct>[]) => {
    const idsToDelete = rows.map((row) => row.original.id);
    setDeletedIds((prev) => new Set([...prev, ...idsToDelete]));
    console.log("Deleted products:", idsToDelete);
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

  // Get product list data
  const productListData = fetchProducts.data?.data ?? [];

  // Get total items count from API
  const totalItems = fetchProductsCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <ProductTable
        columns={productTableColumns}
        data={productListData}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={fetchProducts.isLoading}
      />
    </div>
  );
};

export default ProductView;
