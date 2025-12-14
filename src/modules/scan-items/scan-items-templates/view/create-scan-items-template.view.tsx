"use client";

import { useParams, useRouter } from "next/navigation";
import { createScanItemsTemplatesApi } from "../api/create-scan-items-templates.api";
import { ScanItemTemplateForm } from "../components/scan-items-template-form/scan-items-template-form";
import { ScanItemTemplateSchemaType } from "../schema/scan-items-templates.schema";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const CreateScanItemTemplateViewPage = () => {
  const { t } = useTranslation("scan-items-template");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const createScanItemTemplateMutation = createScanItemsTemplatesApi.useCreateScanItemsTemplates();

  const onSubmit = async (values: ScanItemTemplateSchemaType) => {
    await createScanItemTemplateMutation.mutateAsync(
      {
        orgId: params.orgId,
        values,
      },
      {
        onSuccess: ({ data }) => {
          if (data.status === "OK") {
            toast.success(t("messages.createSuccess"));
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
        urlTemplate: "",
        serialPrefixDigit: 0,
        pinDigit: 0,
        serialDigit: 0,
        generatorCount: 0,
        notificationEmail: "",
      }}
      isUpdate={false}
      onSubmit={onSubmit}
    />
  );
};

export default CreateScanItemTemplateViewPage;
