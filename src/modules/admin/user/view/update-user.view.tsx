"use client";

import { useParams, useRouter } from "next/navigation";
import { UserForm } from "../components/user-form/user-form";
import { getUserApi } from "../api/get-user.api";
import { Loader } from "lucide-react";
import { updateUserApi } from "../api/update-user.api";
import { UserSchemaType } from "../schema/user.schema";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchUsersApi } from "../api/fetch-users.api";

const UpdateUserView = () => {
  const params = useParams<{ orgId: string; userId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getUser = getUserApi.useQuery(params);
  const updateUserMutation = updateUserApi.useMutation();

  if (getUser.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (getUser.error) {
    throw new Error(getUser.error.message);
  }

  const userPayload = getUser.data?.data?.orgUser;

  if (!userPayload) {
    throw new Error("User Not Found");
  }

  const handleUpdateUser = async (values: UserSchemaType) => {
    await updateUserMutation.mutateAsync(
      {
        orgId: params.orgId,
        userId: params.userId,
        values: values,
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status === "OK") {
            await queryClient.invalidateQueries({
              queryKey: [getUserApi.key],
              refetchType: "active",
            });

            await queryClient.invalidateQueries({
              queryKey: fetchUsersApi.key,
              refetchType: "active",
            });

            toast.success("Update User Success");
            return router.back();
          }

          return toast.error("Update User Failed");
        },
        onError: () => {
          return toast.error("Update User Failed");
        },
      }
    );
  };

  return (
    <UserForm
      initialValue={{
        roles: userPayload.roles ?? [],
        tmpUserEmail: userPayload.tmpUserEmail ?? "",
        userName: userPayload.userName,
      }}
      isUpdate
      onSubmit={handleUpdateUser}
    />
  );
};

export default UpdateUserView;
