"use client";

import { useParams, useRouter } from "next/navigation";
import { createScanItemsTemplatesApi } from "../api/create-scan-items-templates.api";
import { ScanItemTemplateForm } from "../components/scan-items-template-form/scan-items-template-form";
import { ScanItemTemplateSchemaType } from "../schema/scan-items-templates.schema";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { LoaderIcon } from "lucide-react";
import { scanItemThemplateApi } from "../../scan-items/api/scan-item-themplete.api";

const CreateScanItemTemplateViewPage = () => {
  const { t } = useTranslation("scan-items-template");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();

  const getScanItemDefaultTemplate =
    scanItemThemplateApi.getScanItemThemplateDefaultQuery.useQuery({
      orgId: params.orgId,
    });

  const createScanItemTemplateMutation =
    createScanItemsTemplatesApi.useCreateScanItemsTemplates();

  if (getScanItemDefaultTemplate.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (getScanItemDefaultTemplate.isError) {
    if (getScanItemDefaultTemplate.error.response?.status === 403) {
      return <NoPermissionsPage errors={getScanItemDefaultTemplate.error} />;
    }
    throw new Error(getScanItemDefaultTemplate.error.message);
  }

  const getScanItemDefulatPayload = getScanItemDefaultTemplate.data?.data;

  const onSubmit = async (
    values: ScanItemTemplateSchemaType,
    callback: () => void
  ) => {
    await createScanItemTemplateMutation.mutateAsync(
      {
        orgId: params.orgId,
        values,
      },
      {
        onSuccess: ({ data }) => {
          if (data.status === "OK") {
            toast.success(t("messages.createSuccess"));
            callback?.();
            return router.back();
          }

          return toast.error(data.description || t("messages.createError"));
        },
      }
    );
  };

  return (
    <ScanItemTemplateForm
      initialValue={{
        templateName: "",
        description: "",
        tags: "",
        urlTemplate: getScanItemDefulatPayload?.urlTemplate ?? "",
        serialPrefixDigit: getScanItemDefulatPayload?.serialPrefixDigit ?? 0,
        generatorCount: getScanItemDefulatPayload?.generatorCount ?? 0,
        serialDigit: getScanItemDefulatPayload?.serialDigit ?? 0,
        pinDigit: getScanItemDefulatPayload?.pinDigit ?? 0,
        notificationEmail: getScanItemDefulatPayload?.notificationEmail ?? "",
      }}
      isUpdate={false}
      onSubmit={onSubmit}
    />
  );
};

export default CreateScanItemTemplateViewPage;
