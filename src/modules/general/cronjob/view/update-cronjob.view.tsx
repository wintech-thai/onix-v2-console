"use client";

import { useParams } from "next/navigation";
import { getCronJobApi } from "../api/get-cron-job.api";
import { LoaderIcon } from "lucide-react";
import { CronJobForm } from "../components/cronjob-form/cronjob-form";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const UpdateCronJobView = () => {
  const params = useParams<{ orgId: string; jobId: string }>();
  const getCronJob = getCronJobApi.cronJob.useQuery(params.orgId, params.jobId);

  if (getCronJob.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (getCronJob.error) {
    if (getCronJob.error?.response?.status === 403) {
      return <NoPermissionsPage errors={getCronJob.error} />;
    }
    throw new Error(getCronJob.error.message);
  }

  const cronJobPayload = getCronJob.data?.data;
  if (!cronJobPayload) {
    throw new Error("CronJob Not Found");
  }

  const handleUpdate = async () => {
    return;
  };

  return (
    <CronJobForm
      initialValue={{
        description: cronJobPayload.description ?? "",
        name: cronJobPayload.name ?? "",
        parameters: cronJobPayload.parameters ?? [],
        tags: cronJobPayload.tags ?? "",
      }}
      cronJobData={cronJobPayload}
      isUpdate
      onSubmit={handleUpdate}
    />
  );
};

export default UpdateCronJobView;
