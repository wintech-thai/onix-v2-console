"use client";

import { useParams, useRouter } from "next/navigation";
import { ApiKeyForm } from "../components/apikeys-form/apikey-form";
import { getApiKeyApi } from "../api/get-apikey.api";
import { Loader } from "lucide-react";
import { updateApiKeyApi } from "../api/update-apikey.api";
import { ApiKeySchemaType } from "../schema/apikey.schema";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchApiKeyApi } from "../api/fetch-apikey.api";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const UpdateApiKeyView = () => {
  const { t } = useTranslation("apikey");
  const params = useParams<{ orgId: string; apikeyId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getApiKey = getApiKeyApi.useGetApiKey(params);

  const updateApiKeyMutation = updateApiKeyApi.useUpdateApiKey();

  if (getApiKey.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (getApiKey.isError) {
    if (getApiKey.error.response?.status === 403) {
      return <NoPermissionsPage errors={getApiKey.error} />;
    }

    throw new Error(getApiKey.error.message);
  }

  const apiKeyPayload = getApiKey.data?.data.apiKey;

  if (!apiKeyPayload) {
    throw new Error("API Key Not Found");
  }

  const handleUpdateApiKey = async (values: ApiKeySchemaType) => {
    await updateApiKeyMutation.mutateAsync(
      {
        orgId: params.orgId,
        apiKeyId: params.apikeyId,
        values: values,
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status === "OK") {
            await queryClient.invalidateQueries({
              queryKey: [getApiKeyApi.key],
              refetchType: "active",
            });

            await queryClient.invalidateQueries({
              queryKey: fetchApiKeyApi.key,
              refetchType: "active",
            });

            toast.success(t("messages.updateSuccess"));
            return router.back();
          }

          return toast.error(data.description || t("messages.updateError"));
        },
      }
    );
  };

  return (
    <ApiKeyForm
      initialValue={{
        keyName: apiKeyPayload.keyName || "",
        keyDescription: apiKeyPayload.keyDescription || "",
        roles: apiKeyPayload.roles ?? [],
        customRoleDesc: apiKeyPayload.customRoleDesc || null,
        customRoleId: apiKeyPayload.customRoleId || null,
        customRoleName: apiKeyPayload.customRoleName || null,
      }}
      isUpdate
      onSubmit={handleUpdateApiKey}
    />
  );
};

export default UpdateApiKeyView;
