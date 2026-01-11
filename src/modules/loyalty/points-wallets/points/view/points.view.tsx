"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePointsTableColumns } from "../components/points-table/points-columns.table";
import { useQueryStates, parseAsInteger } from "nuqs";
import { useMemo, useEffect, useState } from "react";
import dayjs from "dayjs";
import { IPoints, fetchPointsApi } from "../api/fetch-points.api";
import { PointsTable } from "../components/points-table/points-table";
import { getWalletsApi } from "../../wallets/api/get-wallets.api";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const PointViewPage = () => {
  const { t } = useTranslation(["wallets", "common"]);
  const params = useParams<{ orgId: string; walletId: string }>();
  const router = useRouter();
  const [data, setData] = useState<IPoints[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
  });

  const { page, limit } = queryState;

  // Memoize dates to prevent infinite refetch loop
  // Assuming we want to show all history or default to a range, using a wide range for now or similar to wallets
  const dateRange = useMemo(
    () => ({
      fromDate: dayjs().subtract(1, "year").toISOString(), // Default to 1 year for now
      toDate: dayjs().toISOString(),
    }),
    []
  );

  const getWallet = getWalletsApi.useGetWallets({
    orgId: params.orgId,
    walletId: params.walletId,
  });

  const fetchPoints = fetchPointsApi.useFetchPoints({
    orgId: params.orgId,
    walletId: params.walletId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      walletId: params.walletId,
    },
  });

  const fetchPointsCount = fetchPointsApi.useFetchPointsCount({
    orgId: params.orgId,
    walletId: params.walletId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
      walletId: params.walletId,
    },
  });

  useEffect(() => {
    if (fetchPoints.data?.data) {
      // API returns AxiosResponse<FetchPointsResponse>, so data.data is FetchPointsResponse (IPoints[])
      setData(fetchPoints.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchPoints.data]);

  const handlePageChange = (newPage: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ page: newPage });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ limit: newLimit, page: 1 });
  };

  const columns = usePointsTableColumns();
  const totalItems = fetchPointsCount.data?.data ?? 0;
  const wallet = getWallet.data?.data?.wallet;

  if (getWallet.isError) {
    if (getWallet.error?.response?.status === 403) {
      return <NoPermissionsPage errors={getWallet.error} />;
    }
    throw new Error(getWallet.error.message);
  }

  if (fetchPoints.isError) {
    if (fetchPoints.error?.response?.status === 403) {
      return <NoPermissionsPage errors={fetchPoints.error} />;
    }
    throw new Error(fetchPoints.error.message);
  }

  if (fetchPointsCount.isError) {
    if (fetchPointsCount.error?.response?.status === 403) {
      return <NoPermissionsPage errors={fetchPointsCount.error} />;
    }
    throw new Error(fetchPointsCount.error.message);
  }

  return (
    <div className="h-full flex flex-col pt-4 px-4">
      <header className="flex items-center gap-2 border-b pb-2 shrink-0">
        <ArrowLeftIcon
          className="cursor-pointer size-6"
          onClick={() => router.back()}
        />
        <div className="flex flex-col">
          <span className="text-2xl">
            {t("points.title", "Point Transaction")}:{" "}
            <span className="text-2xl font-bold">({wallet?.name || "-"})</span>
          </span>

          <span className="text-lg">
            {t("points.balance", "Balance")}:{" "}
            <span className="font-bold">
              {(wallet?.pointBalance ?? 0).toLocaleString()}
            </span>
          </span>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <PointsTable
          columns={columns}
          data={data}
          totalItems={totalItems}
          currentPage={page}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          isLoading={
            (fetchPoints.isLoading && !hasLoadedBefore) || isPageOrLimitChanging
          }
        />
      </div>
    </div>
  );
};

export default PointViewPage;
