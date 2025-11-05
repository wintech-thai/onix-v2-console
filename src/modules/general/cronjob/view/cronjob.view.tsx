"use client";

import { useParams } from "next/navigation";
import { fetchCronJobApi, IJob } from "../api/fetch-cron-job.api";
import { CronJobTable } from "../components/cronjob-table/cronjob.table";
import { useCronJobTableColumns } from "../components/cronjob-table/cronjob-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteCronJobApi } from "../api/delete-cron-job.api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const CronJobView = () => {
  const { t } = useTranslation(["cronjob", "common"]);
  const params = useParams<{ orgId: string }>();
  const [data, setData] = useState<IJob[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });
  const queryClient = useQueryClient();

  const cronJobTableColumns = useCronJobTableColumns();

  const deleteCronJob = deleteCronJobApi.useMuatation();

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

  // Fetch cronjobs from API
  const fetchCronJobs = fetchCronJobApi.cronJob.useQuery(params.orgId, {
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    jobType: "",
  });

  useEffect(() => {
    if (fetchCronJobs.data?.data) {
      setData(fetchCronJobs.data.data);
      setHasLoadedBefore(true);
    }
  }, [fetchCronJobs.data]);

  const fetchCronJobsCount = fetchCronJobApi.cronJobCount.useQuery(params.orgId, {
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    offset: (page - 1) * limit,
    limit: limit,
    fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
    jobType: "",
  });

  if (fetchCronJobs.isError) {
    if (fetchCronJobs.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetJobs" />
    }
    throw new Error(fetchCronJobs.error.message);
  }

  if (fetchCronJobsCount.isError) {
    if (fetchCronJobsCount.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetJobCount" />
    }
    throw new Error(fetchCronJobsCount.error.message);
  }

  const handleDelete = async (rows: Row<IJob>[], callback: () => void) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(t("common:delete.loading"));

    const results = await Promise.allSettled(
      idsToDelete.map((id) =>
        deleteCronJob.mutateAsync({
          orgId: params.orgId,
          jobId: id,
        })
      )
    );

    toast.dismiss(toastId);

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const errorCount = results.filter((r) => r.status === "rejected").length;
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
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Failed to delete cron job:", result.reason);
        }
      });
    }

    await queryClient.invalidateQueries({
      queryKey: fetchCronJobApi.key,
      refetchType: "active",
    });

    callback();
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
  const totalItems = fetchCronJobsCount.data?.data ?? 0;

  return (
    <div className="h-full pt-4 px-4 space-y-4">
      <DeleteConfirmationDialog />
      <CronJobTable
        columns={cronJobTableColumns}
        data={data}
        onDelete={handleDelete}
        totalItems={totalItems}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSearch={handleSearch}
        isLoading={fetchCronJobs.isLoading && !hasLoadedBefore}
      />
    </div>
  );
};

export default CronJobView;
