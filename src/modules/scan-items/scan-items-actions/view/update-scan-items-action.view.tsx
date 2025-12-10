"use client";

import { useParams, useRouter } from "next/navigation";
import { ScanItemsActionForm } from "../components/scan-items-action-form/scan-items-action-form";
import { getScanItemActionsApi } from "../api/get-scan-items-actions.api";
import { Loader } from "lucide-react";
import { updateScanItemsActionsApi } from "../api/update-scan-items-actions.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchScanItemsActionsApi } from "../api/fetch-scan-items-actions.api";
import { NoPermissionsPage } from "@/components/ui/no-permissions";
import { ScanItemsActionsSchemaType } from "../schema/scan-items-actions.schema";

const UpdateScanItemsActionViewPage = () => {
  const params = useParams<{ orgId: string; scanItemsActionId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getScanItemAction = getScanItemActionsApi.useGetScanItemActions({
    orgId: params.orgId,
    scanItemsActionId: params.scanItemsActionId,
  });
  const updateScanItemActionMutation = updateScanItemsActionsApi.useUpdateScanItemsActions();

  if (getScanItemAction.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (getScanItemAction.error) {
    if (getScanItemAction.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetScanItemActionById" />
    }
    throw new Error(getScanItemAction.error.message);
  }

  const actionPayload = getScanItemAction.data?.data.scanItemAction;

  if (!actionPayload) {
    throw new Error("Scan Item Action Not Found");
  }

  const handleUpdateScanItemAction = async (values: ScanItemsActionsSchemaType) => {
    await updateScanItemActionMutation.mutateAsync(
      {
        orgId: params.orgId,
        scanItemsActionId: params.scanItemsActionId,
        values: values,
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status === "OK") {
            await queryClient.invalidateQueries({
              queryKey: [getScanItemActionsApi.key],
              refetchType: "active",
            });

            await queryClient.invalidateQueries({
              queryKey: fetchScanItemsActionsApi.key,
              refetchType: "active",
            });

            toast.success("Scan item action updated successfully");
            return router.back();
          }

          return toast.error(data.description || "Failed to update scan item action");
        },
      }
    );
  };

  return (
    <ScanItemsActionForm
      initialValue={{
        actionName: actionPayload.actionName ?? "",
        description: actionPayload.description ?? "",
        tags: actionPayload.tags ?? "",
        themeVerify: actionPayload.themeVerify ?? "",
        redirectUrl: actionPayload.redirectUrl ?? "",
        encryptionKey: actionPayload.encryptionKey ?? "",
        encryptionIV: actionPayload.encryptionIV ?? "",
        registeredAwareFlag: actionPayload.registeredAwareFlag ?? "NO",
      }}
      isUpdate
      onSubmit={handleUpdateScanItemAction}
    />
  );
};

export default UpdateScanItemsActionViewPage;
