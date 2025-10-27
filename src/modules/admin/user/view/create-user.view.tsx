"use client";

import { useParams, useRouter } from "next/navigation";
import { inviteUserApi } from "../api/create-user.api";
import { UserForm } from "../components/user-form/user-form";
import { UserSchemaType } from "../schema/user.schema";
import { toast } from "sonner";

const CreateUserView = () => {
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
            toast.success("Email Send");
            return router.back();
          }

          return toast.error(data.description);
        },
        onError: () => {
          return toast.error("Failed");
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
      }}
      isUpdate={false}
      onSubmit={onSubmit}
    />
  );
};

export default CreateUserView;
