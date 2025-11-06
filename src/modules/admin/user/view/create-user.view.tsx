"use client";

import { useParams, useRouter } from "next/navigation";
import { inviteUserApi } from "../api/create-user.api";
import { UserForm } from "../components/user-form/user-form";
import { UserSchemaType } from "../schema/user.schema";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const CreateUserView = () => {
  const { t } = useTranslation("user");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const inviteUserMutation = inviteUserApi.useMutation();

  const onSubmit = async (values: UserSchemaType) => {
    await inviteUserMutation.mutateAsync(
      {
        orgId: params.orgId,
        values,
      },
      {
        onSuccess: ({ data }) => {
          if (data.status === "OK") {
            toast.success(t("messages.sendInviteSuccess", { email: values.tmpUserEmail }));
            return router.back();
          }

          return toast.error(data.description || t("messages.createError"));
        },
      }
    );
  };

  return (
    <UserForm
      initialValue={{
        roles: [],
        userName: "",
        tmpUserEmail: "",
        tags: ""
      }}
      isUpdate={false}
      onSubmit={onSubmit}
    />
  );
};

export default CreateUserView;
