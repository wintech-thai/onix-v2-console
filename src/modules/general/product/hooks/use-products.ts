
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { fetchProductsApi, IProduct } from "../api/fetch-products.api";
import { useMemo } from "react";
import dayjs from "dayjs";

export type { IProduct };

export const useProducts = (orgId: string) => {
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
  });

  const { page, limit, searchField, searchValue } = queryState;

  const dateRange = useMemo(
    () => ({
      fromDate: dayjs().subtract(1, "day").toISOString(),
      toDate: dayjs().toISOString(),
    }),
    []
  );

  const fetchProducts = fetchProductsApi.useFetchProductQuery({
    orgId,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    itemType: 1,
  });

  const fetchProductsCount = fetchProductsApi.useFetchProductCount({
    orgId,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    itemType: 1,
  });

  const handlePageChange = (newPage: number) => {
    setQueryState({ page: newPage });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setQueryState({ limit: newLimit, page: 1 });
  };

  const handleSearch = (field: string, value: string) => {
    setQueryState({ searchField: field, searchValue: value, page: 1 });
  };

  return {
    ...queryState,
    products: fetchProducts.data?.data || [],
    totalProducts: fetchProductsCount.data?.data ?? 0,
    isLoading: fetchProducts.isLoading,
    isError: fetchProducts.isError,
    error: fetchProducts.error,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearch,
  };
};
