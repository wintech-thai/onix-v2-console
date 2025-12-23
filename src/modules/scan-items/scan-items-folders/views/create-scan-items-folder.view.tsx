"use client";

import { useParams, useRouter } from "next/navigation";
import { ScanItemsFolderForm } from "../components/scan-items-folder-form/scan-items-folder-form";
import { ScanItemsFolderSchemaType } from "../schema/scan-items-folders.schema";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAddScanItemFolder } from "../hooks/scan-items-hooks";

const CreateScanItemFolderViewPage = () => {
  const { t } = useTranslation("scan-items-folder");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const addScanItemFolder = useAddScanItemFolder();

  const onSubmit = async (values: ScanItemsFolderSchemaType) => {
    await addScanItemFolder.mutateAsync(
      {
        params: {
          orgId: params.orgId,
        },
        data: {
          folderName: values.folderName,
          description: values.description,
          tags: values.tags,
        },
      },
      {
        onSuccess: ({ data }) => {
          if (data.status === "OK" || data.status === "SUCCESS") {
            toast.success(t("messages.createSuccess"));
            return router.back();
          }

          return toast.error(data.description || t("messages.createError"));
        },
        onError: () => {
          toast.error(t("messages.createError"));
        },
      }
    );
  };

  return (
    <ScanItemsFolderForm
      initialValue={{
        folderName: "",
        description: "",
        tags: "",
      }}
      isUpdate={false}
      onSubmit={onSubmit}
    />
  );
};

export default CreateScanItemFolderViewPage;
