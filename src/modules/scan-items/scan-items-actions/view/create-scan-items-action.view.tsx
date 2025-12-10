"use client";

import { useParams, useRouter } from "next/navigation";
import { createScanItemsActionsApi } from "../api/create-scan-items-actions.api";
import { ScanItemsActionForm } from "../components/scan-items-action-form/scan-items-action-form";
import { ScanItemsActionsSchemaType } from "../schema/scan-items-actions.schema";
import { toast } from "sonner";

const CreateScanItemsActionViewPage = () => {
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const createScanItemsActionMutation = createScanItemsActionsApi.useCreateScanItemsActions();

  const onSubmit = async (values: ScanItemsActionsSchemaType) => {
    await createScanItemsActionMutation.mutateAsync(
      {
        orgId: params.orgId,
        values,
      },
      {
        onSuccess: ({ data }) => {
          if (data.status === "OK") {
            toast.success("Scan item action created successfully");
            return router.back();
          }

          return toast.error(data.description || "Failed to create scan item action");
        },
      }
    );
  };

  return (
    <ScanItemsActionForm
      initialValue={{
        actionName: "",
        description: "",
        tags: "",
        themeVerify: "",
        redirectUrl: "",
        encryptionKey: "",
        encryptionIV: "",
        registeredAwareFlag: "NO",
      }}
      isUpdate={false}
      onSubmit={onSubmit}
    />
  );
};

export default CreateScanItemsActionViewPage;
