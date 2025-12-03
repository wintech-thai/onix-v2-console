"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePrivilegeTransactionTableColumns } from "../components/privilege-transaction-table/privilege-transaction-columns.table";
import { useQueryStates, parseAsInteger } from "nuqs";
import { useMemo, useEffect, useState } from "react";
import dayjs from "dayjs";
import { IPrivilegeTx, getPrivilegeTxByIdApi } from "../api/get-privielge-tx-by-id.api";
import { PrivilegeTransactionTable } from "../components/privilege-transaction-table/privilege-transaction.table";
import { getPrivilegesApi } from "../api/get-privileges.api";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const PrivilegeTransactionViewPage = () => {
  const { t } = useTranslation(["privileges", "common"]);
  const params = useParams<{ orgId: string; privilegeId: string }>();
  const router = useRouter();
  const [data, setData] = useState<IPrivilegeTx[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
  });

  const { page, limit } = queryState;

  // Memoize dates to prevent infinite refetch loop
  const dateRange = useMemo(
    () => ({
      fromDate: dayjs().subtract(1, "year").toISOString(),
      toDate: dayjs().toISOString(),
    }),
    []
  );

  const getPrivilege = getPrivilegesApi.useGetPrivileges({
    orgId: params.orgId,
    privilegeId: params.privilegeId,
  });

  const fetchTransactions = getPrivilegeTxByIdApi.useGetPrivilegeTxById({
    orgId: params.orgId,
    privilegeId: params.privilegeId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
    },
  });

  const fetchTransactionsCount = getPrivilegeTxByIdApi.useGetPrivilegeTxByIdCount({
    orgId: params.orgId,
    privilegeId: params.privilegeId,
    params: {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      offset: (page - 1) * limit,
      limit: limit,
    },
  });

  useEffect(() => {
    if (fetchTransactions.data?.data) {
      setData(fetchTransactions.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchTransactions.data]);

  const handlePageChange = (newPage: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ page: newPage });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ limit: newLimit, page: 1 });
  };

  const columns = usePrivilegeTransactionTableColumns();
  const totalItems = fetchTransactionsCount.data?.data ?? 0;
  const privilege = getPrivilege.data?.data;

  if (getPrivilege.isError) {
    if (getPrivilege.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetPrivilegeById" />;
    }
    throw new Error(getPrivilege.error.message);
  }

  if (fetchTransactions.isError) {
    if (fetchTransactions.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetPrivilegeTxsById" />;
    }
    throw new Error(fetchTransactions.error.message);
  }

  if (fetchTransactionsCount.isError) {
    if (fetchTransactionsCount.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetPrivilegeTxsCountById" />;
    }
    throw new Error(fetchTransactionsCount.error.message);
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
            {t("transaction.title", "Privilege Transaction")}:{" "}
            <span className="text-2xl font-bold">({privilege?.code || "-"})</span>
          </span>

          <span className="text-lg">
            {t("transaction.balance", "Balance")}:{" "}
            <span className="font-bold">
              {(privilege?.currentBalance ?? 0).toLocaleString()}
            </span>
          </span>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <PrivilegeTransactionTable
          columns={columns}
          data={data}
          totalItems={totalItems}
          currentPage={page}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          isLoading={
            (fetchTransactions.isLoading && !hasLoadedBefore) || isPageOrLimitChanging
          }
        />
      </div>
    </div>
  );
};

export default PrivilegeTransactionViewPage;
