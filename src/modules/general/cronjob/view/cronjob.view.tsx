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

const CronJobView = () => {
  const { t } = useTranslation(["cronjob"]);
  const params = useParams<{ orgId: string }>();
  const [, setIsDeleting] = useState(false);
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
    throw new Error(fetchCronJobs.error.message);
  }

  if (fetchCronJobsCount.isError) {
    throw new Error(fetchCronJobsCount.error.message);
  }

  const handleDelete = async (
    rows: Row<IJob>[],
    callback: () => void
  ) => {
    const ok = await confirmDelete();

    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);
    let successCount = 0;
    let errorCount = 0;

    // Delete items one by one
    setIsDeleting(true);
    for (const id of idsToDelete) {
      await deleteCronJob.mutateAsync(
        {
          orgId: params.orgId,
          jobId: id,
        },
        {
          onSuccess: ({ data }) => {
            if (data.status !== "OK") {
              errorCount++;
              toast.error(data.description || t("delete.error"));
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
    setIsDeleting(false);

    // Show summary toast
    if (successCount > 0) {
      toast.success(
        `${t("delete.success")} (${successCount}/${idsToDelete.length})`
      );
    }
    if (errorCount > 0) {
      toast.error(
        `${t("delete.error")} (${errorCount}/${idsToDelete.length})`
      );
    }

    // Invalidate queries using prefix matching - will invalidate all queries starting with these keys
    await queryClient.invalidateQueries({
      queryKey: fetchCronJobApi.key,
      refetchType: "active",
    });

    // Clear selection after delete attempt
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
  const totalItems = typeof fetchCronJobsCount.data?.data === "number"
    ? fetchCronJobsCount.data.data
    : 0;

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

