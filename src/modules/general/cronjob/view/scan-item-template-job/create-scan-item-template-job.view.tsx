"use client";

import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useId } from "react";
import { toast } from "sonner";
import { fetchCronJobApi } from "../../api/fetch-cron-job.api";
import { getCronJobApi } from "../../api/get-cron-job.api";
import { CronJobScehmaType } from "../../schema/cronjob.schema";
import { ScanItemTemplateJobForm } from "../../components/scan-item-template-job-form/scan-item-template-job-form";
import { createScanItemTemplateJobApi } from "../../api/scan-item-template-job/create-scan-item-template-job.api";

const CreateScanItemTemplateJobViewPage = () => {
  const router = useRouter();
  const params = useParams<{ orgId: string; scanItemTemplateId: string }>();
  const key = useId();
  const getDefaultValue = getCronJobApi.defaultCronJob.useQuery(
    params.orgId,
    key
  );
  const queryClient = useQueryClient();

  const createScanItemTemplateJob = createScanItemTemplateJobApi.useMutation();

  if (getDefaultValue.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (getDefaultValue.isError) {
    if (getDefaultValue.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetJobDefault/ScanItemGenerator" />;
    }
    throw new Error(getDefaultValue.error.message);
  }

  const defaultPayload = getDefaultValue.data?.data;

  if (!defaultPayload) {
    throw new Error("Default CronJob Not Found");
  }

  const handleSubmit = async (value: CronJobScehmaType) => {
    await createScanItemTemplateJob.mutateAsync(
      {
        orgId: params.orgId,
        scanItemTemplateId: params.scanItemTemplateId,
        data: value,
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status !== "OK") {
            return toast.error("Create CronJob Error");
          }

          toast.success("Create CronJob Success");

          await queryClient.invalidateQueries({
            queryKey: fetchCronJobApi.key,
            refetchType: "active",
          });

          router.back();
        },
      }
    );
  };

  return (
    <ScanItemTemplateJobForm
      initialValue={{
        description: defaultPayload.description,
        name: defaultPayload.name,
        parameters: defaultPayload.parameters,
        tags: defaultPayload.tags ?? "",
      }}
      cronJobData={defaultPayload}
      isUpdate={false}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateScanItemTemplateJobViewPage;
