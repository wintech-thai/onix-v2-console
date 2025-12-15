"use client";

import { useParams, useRouter } from "next/navigation";
import { ScanItemTemplateForm } from "../components/scan-items-template-form/scan-items-template-form";
import { getScanItemsTemplatesApi } from "../api/get-scan-items-templates.api";
import { Loader } from "lucide-react";
import { updateScanItemsTemplatesApi } from "../api/update-scan-items-templates.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchScanItemsTemplatesApi } from "../api/fetch-scan-items-templates.api";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { ScanItemTemplateSchemaType } from "../schema/scan-items-templates.schema";
import { useTranslation } from "react-i18next";

const UpdateScanItemTemplateViewPage = () => {
  const { t } = useTranslation("scan-items-template");
  const params = useParams<{ orgId: string; scanItemTemplateId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getScanItemTemplate = getScanItemsTemplatesApi.useGetScanItemsTemplates({
    orgId: params.orgId,
    scanItemTemplateId: params.scanItemTemplateId,
  });
  const updateScanItemTemplateMutation = updateScanItemsTemplatesApi.useUpdateScanItemsTemplates();

  if (getScanItemTemplate.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (getScanItemTemplate.error) {
    if (getScanItemTemplate.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetScanItemTemplateById" />
    }
    throw new Error(getScanItemTemplate.error.message);
  }

  const templatePayload = getScanItemTemplate.data?.data.scanItemTemplate;

  if (!templatePayload) {
    throw new Error("Scan Item Template Not Found");
  }

  const handleUpdateScanItemTemplate = async (values: ScanItemTemplateSchemaType, callback: () => void) => {
    await updateScanItemTemplateMutation.mutateAsync(
      {
        orgId: params.orgId,
        templateId: params.scanItemTemplateId,
        values: values,
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status === "OK") {
            await queryClient.invalidateQueries({
              queryKey: [getScanItemsTemplatesApi.key],
              refetchType: "active",
            });

            await queryClient.invalidateQueries({
              queryKey: [fetchScanItemsTemplatesApi.key],
              refetchType: "active",
            });

            callback?.();

            toast.success(t("messages.updateSuccess"));
            return router.back();
          }

          return toast.error(data.description || t("messages.updateError"));
        },
      }
    );
  };

  return (
    <ScanItemTemplateForm
      initialValue={{
        templateName: templatePayload.templateName ?? "",
        description: templatePayload.description ?? "",
        tags: templatePayload.tags ?? "",
        urlTemplate: templatePayload.urlTemplate ?? "",
        serialPrefixDigit: templatePayload.serialPrefixDigit ?? 0,
        pinDigit: templatePayload.pinDigit ?? 0,
        serialDigit: templatePayload.serialDigit ?? 0,
        generatorCount: templatePayload.generatorCount ?? 0,
        notificationEmail: templatePayload.notificationEmail ?? "",
      }}
      isUpdate
      onSubmit={handleUpdateScanItemTemplate}
    />
  );
};

export default UpdateScanItemTemplateViewPage;
