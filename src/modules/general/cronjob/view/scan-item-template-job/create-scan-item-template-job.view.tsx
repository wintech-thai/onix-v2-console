"use client";

import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchCronJobApi } from "../../api/fetch-cron-job.api";
import { CronJobScehmaType } from "../../schema/cronjob.schema";
import { ScanItemTemplateJobForm } from "../../components/scan-item-template-job-form/scan-item-template-job-form";
import { createScanItemTemplateJobApi } from "../../api/scan-item-template-job/create-scan-item-template-job.api";
import { getDefaultScanItemsTemplatesApi } from "@/modules/scan-items/scan-items-templates/api/get-default-scan-items-templates.api";
import { useId } from "react";

const CreateScanItemTemplateJobViewPage = () => {
  const router = useRouter();
  const params = useParams<{ orgId: string; scanItemTemplateId: string }>();

  const getScanItemTemplateDefaultValue =
    getDefaultScanItemsTemplatesApi.useGetDefaultScanItemsTemplates({
      ...params,
      key: useId()
    });
  const queryClient = useQueryClient();

  const createScanItemTemplateJob = createScanItemTemplateJobApi.useMutation();

  if (getScanItemTemplateDefaultValue.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (getScanItemTemplateDefaultValue.isError) {
    if (getScanItemTemplateDefaultValue.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetJobDefault/ScanItemGenerator" />;
    }
    throw new Error(getScanItemTemplateDefaultValue.error.message);
  }

  const defaultPayload = getScanItemTemplateDefaultValue.data?.data.job;

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
