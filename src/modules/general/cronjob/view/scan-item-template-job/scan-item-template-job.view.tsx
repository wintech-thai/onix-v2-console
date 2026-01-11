"use client";

import { useParams, useRouter } from "next/navigation";
import {
  fetchCronJobApi,
  IJob,
} from "../../api/scan-item-template-job/fetch-scan-item-template-job.api";
import { ScanItemTemplateJobTable } from "../../components/scan-item-template-job-table/scan-item-template-job.table";
import { useScanItemTemplateJobTableColumns } from "../../components/scan-item-template-job-table/scan-item-template-job-columns.table";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Row } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteCronJobApi } from "../../api/delete-cron-job.api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { getScanItemsTemplatesApi } from "@/modules/scan-items/scan-items-templates/api/get-scan-items-templates.api";
import { ArrowLeftIcon } from "lucide-react";

const ScanItemTemplateJobViewPage = () => {
  const { t } = useTranslation(["cronjob", "common"]);
  const params = useParams<{ orgId: string; scanItemTemplateId: string }>();
  const router = useRouter();
  const [data, setData] = useState<IJob[]>([]);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [isPageOrLimitChanging, setIsPageOrLimitChanging] = useState(false);
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: t("delete.title"),
    message: t("delete.message"),
    variant: "destructive",
  });
  const queryClient = useQueryClient();

  const scanItemTemplateJobTableColumns = useScanItemTemplateJobTableColumns();

  const deleteCronJob = deleteCronJobApi.useMuatation();

  // Use nuqs to persist state in URL
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
  });

  const { page, limit, searchField, searchValue } = queryState;

  // Get scan item template info
  const getScanItemTemplate = getScanItemsTemplatesApi.useGetScanItemsTemplates(
    {
      orgId: params.orgId,
      scanItemTemplateId: params.scanItemTemplateId,
    }
  );

  // Memoize dates to prevent infinite refetch loop
  const dateRange = useMemo(
    () => ({
      fromDate: dayjs().subtract(1, "day").toISOString(),
      toDate: dayjs().toISOString(),
    }),
    []
  );

  // Fetch scan item template jobs from API
  const fetchScanItemTemplateJobs =
    fetchCronJobApi.useFetchScanItemTemplateJob.useQuery({
      orgId: params.orgId,
      scanItemTemplateId: params.scanItemTemplateId,
      params: {
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        offset: (page - 1) * limit,
        limit: limit,
        fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
        jobType: "",
        scanItemTemplateId: params.scanItemTemplateId,
      },
    });

  useEffect(() => {
    if (fetchScanItemTemplateJobs.data?.data) {
      setData(fetchScanItemTemplateJobs.data.data);
      setHasLoadedBefore(true);
      setIsPageOrLimitChanging(false);
    }
  }, [fetchScanItemTemplateJobs.data]);

  const fetchScanItemTemplateJobsCount =
    fetchCronJobApi.useFetchScanItemTemplateJobCount.useQuery({
      orgId: params.orgId,
      scanItemTemplateId: params.scanItemTemplateId,
      params: {
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        offset: (page - 1) * limit,
        limit: limit,
        fullTextSearch: searchField === "fullTextSearch" ? searchValue : "",
        jobType: "",
        scanItemTemplateId: params.scanItemTemplateId,
      },
    });

  if (getScanItemTemplate.isError) {
    if (getScanItemTemplate.error?.response?.status === 403) {
      return <NoPermissionsPage errors={getScanItemTemplate.error} />;
    }
    throw new Error(getScanItemTemplate.error.message);
  }

  if (fetchScanItemTemplateJobs.isError) {
    if (fetchScanItemTemplateJobs.error?.response?.status === 403) {
      return <NoPermissionsPage errors={fetchScanItemTemplateJobs.error} />;
    }
    throw new Error(fetchScanItemTemplateJobs.error.message);
  }

  if (fetchScanItemTemplateJobsCount.isError) {
    if (fetchScanItemTemplateJobsCount.error?.response?.status === 403) {
      return (
        <NoPermissionsPage errors={fetchScanItemTemplateJobsCount.error} />
      );
    }
    throw new Error(fetchScanItemTemplateJobsCount.error.message);
  }

  const handleDelete = async (rows: Row<IJob>[], callback: () => void) => {
    const ok = await confirmDelete();
    if (!ok) return;

    const idsToDelete = rows.map((row) => row.original.id);

    if (idsToDelete.length === 0) {
      return;
    }

    const toastId = toast.loading(t("common:delete.loading"));

    let successCount = 0;
    let errorCount = 0;

    // ยิงทีละอันเพื่อป้องกัน race condition และ rate limit
    for (const id of idsToDelete) {
      try {
        await deleteCronJob.mutateAsync({
          orgId: params.orgId,
          jobId: id,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to delete job:", error);
      }
    }

    toast.dismiss(toastId);

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
    }

    await queryClient.invalidateQueries({
      queryKey: fetchCronJobApi.key,
      refetchType: "active",
    });

    callback();
  };

  const handlePageChange = (newPage: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ page: newPage });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setIsPageOrLimitChanging(true);
    setQueryState({ limit: newLimit, page: 1 });
  };

  const handleSearch = (field: string, value: string) => {
    setQueryState({ searchField: field, searchValue: value, page: 1 });
  };

  // Get total items count from API
  const totalItems = fetchScanItemTemplateJobsCount.data?.data ?? 0;
  const template = getScanItemTemplate.data?.data.scanItemTemplate;

  return (
    <div className="h-full flex flex-col pt-4 px-4">
      <header className="flex items-center gap-2 border-b pb-2 shrink-0 mb-4">
        <ArrowLeftIcon
          className="cursor-pointer size-6"
          onClick={() => router.back()}
        />
        <div className="flex flex-col">
          <span className="text-2xl">
            {t("scanItemTemplate.title", "Scan Item Template Jobs")}:{" "}
            <span className="text-2xl font-bold">
              ({template?.templateName || "-"})
            </span>
          </span>

          <span className="text-lg">
            {t("scanItemTemplate.description", "Description")}:{" "}
            <span className="font-bold">{template?.description || "-"}</span>
          </span>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <DeleteConfirmationDialog />
        <ScanItemTemplateJobTable
          columns={scanItemTemplateJobTableColumns}
          data={data}
          onDelete={handleDelete}
          totalItems={totalItems}
          currentPage={page}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          onSearch={handleSearch}
          isLoading={
            (fetchScanItemTemplateJobs.isLoading && !hasLoadedBefore) ||
            isPageOrLimitChanging
          }
        />
      </div>
    </div>
  );
};

export default ScanItemTemplateJobViewPage;
