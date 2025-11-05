"use client";

import { useParams } from "next/navigation";
import { createApiKeyApi } from "../api/create-apikey.api";
import { ApiKeyForm } from "../components/apikeys-form/apikey-form";
import { ApiKeySchemaType } from "../schema/apikey.schema";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ShowApiKeyModal } from "../components/modal/show-apikey.modal";

const CreateApiKeyView = () => {
  const { t } = useTranslation("apikey");
  const params = useParams<{ orgId: string }>();
  const createApiKeyMutation = createApiKeyApi.useCreateApiKey();
  const [showModal, setShowModal] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState("");

  const onSubmit = async (values: ApiKeySchemaType) => {
    await createApiKeyMutation.mutateAsync(
      {
        orgId: params.orgId,
        values: {
          keyName: values.keyName,
          keyDescription: values.keyDescription,
          roles: values.roles,
        },
      },
      {
        onSuccess: ({ data }) => {
          if (data.status === "OK") {
            toast.success(t("messages.createSuccess"));
            setCreatedApiKey(data.apiKey.apiKey);
            setShowModal(true);
            return;
          }

          return toast.error(data.description || t("messages.createError"));
        }
      }
    );
  };

  return (
    <>
      <ShowApiKeyModal isOpen={showModal} apiKey={createdApiKey} />
      <ApiKeyForm
        initialValue={{
          keyName: "",
          keyDescription: "",
          roles: [],
        }}
        isUpdate={false}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default CreateApiKeyView;
