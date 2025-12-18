"use client";

import { useParams, useRouter } from "next/navigation";
import { ScanItemsFolderForm } from "../components/scan-items-folder-form/scan-items-folder-form";
import { Loader } from "lucide-react";
import { ScanItemsFolderSchemaType } from "../schema/scan-items-folders.schema";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import {
  useGetScanItemFolderById,
  useUpdateScanItemFolder,
} from "../hooks/scan-items-hooks";
import { getScanItemFolders } from "../api/scan-items-service";

const UpdateScanItemsFolderViewPage = () => {
  const { t } = useTranslation("scan-items-folder");
  const params = useParams<{ orgId: string; scanItemFolderId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getScanItemFolder = useGetScanItemFolderById({
    orgId: params.orgId,
    folderId: params.scanItemFolderId,
  });

  const updateScanItemFolder = useUpdateScanItemFolder();

  if (getScanItemFolder.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (getScanItemFolder.isError) {
    if (getScanItemFolder.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetScanItemFolderById" />;
    }

    throw new Error(getScanItemFolder.error.message);
  }

  const folderData = getScanItemFolder.data?.data.scanItemFolder;

  if (!folderData) {
    throw new Error("Scan Item Folder Not Found");
  }

  const handleUpdateFolder = async (values: ScanItemsFolderSchemaType) => {
    await updateScanItemFolder.mutateAsync(
      {
        params: {
          orgId: params.orgId,
          folderId: params.scanItemFolderId,
        },
        data: {
          folderName: values.folderName,
          description: values.description,
          tags: values.tags,
        },
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status === "OK" || data.status === "SUCCESS") {
            await queryClient.invalidateQueries({
              queryKey: getScanItemFolders.key,
              refetchType: "active",
            });

            toast.success(t("messages.updateSuccess"));
            return router.back();
          }

          return toast.error(data.description || t("messages.updateError"));
        },
        onError: () => {
          toast.error(t("messages.updateError"));
        },
      }
    );
  };

  return (
    <ScanItemsFolderForm
      initialValue={{
        folderName: folderData.folderName || "",
        description: folderData.description || "",
        tags: folderData.tags || "",
      }}
      isUpdate
      onSubmit={handleUpdateFolder}
    />
  );
};

export default UpdateScanItemsFolderViewPage;
