"use client";

import { useParams, useRouter } from "next/navigation";
import { getCronJobApi } from "../api/get-cron-job.api";
import { CronJobForm } from "../components/cronjob-form/cronjob-form";
import { LoaderIcon } from "lucide-react";
import { createCronJobApi } from "../api/create-cron-job.api";
import { CronJobScehmaType } from "../schema/cronjob.schema";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCronJobApi } from "../api/fetch-cron-job.api";
import { toast } from "sonner";
import { RouteConfig } from "@/config/route.config";
import { useId } from "react";

const CreateCronJobView = () => {
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const key = useId();
  const getDefaultValue = getCronJobApi.defaultCronJob.useQuery(params.orgId, key);
  const queryClient = useQueryClient();

  const createCronJob = createCronJobApi.useMutation();

  if (getDefaultValue.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (getDefaultValue.error) {
    throw new Error(getDefaultValue.error.message);
  }

  const defaultPayload = getDefaultValue.data?.data;

  if (!defaultPayload) {
    throw new Error("Default CronJob Not Found");
  }

  const handleSubmit = async (value: CronJobScehmaType) => {
    await createCronJob.mutateAsync(
      {
        orgId: params.orgId,
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

          router.push(RouteConfig.GENERAL.JOB.LIST(params.orgId));
        },
        onError: () => {
          toast.error("Create CronJob Error");
        },
      }
    );
  };

  return (
    <CronJobForm
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

export default CreateCronJobView;
