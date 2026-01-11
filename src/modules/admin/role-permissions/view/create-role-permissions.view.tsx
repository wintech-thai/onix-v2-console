"use client";

import { useParams, useRouter } from "next/navigation";
import { RolePermissionsForm } from "../components/role-permissions-form/role-permissions-form";
import { RolePermissionsSchemaType } from "../schema/role-permissions.schema";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  useGetInitialCustomRole,
  useAddCustomRole,
} from "../hooks/role-permissions-hooks";
import { Loader } from "lucide-react";
import { getCustomRoles } from "../api/role-permissions.service";

const CreateRolePermissionsViewPage = () => {
  const { t } = useTranslation("role-permissions");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getInitialPermissions = useGetInitialCustomRole({
    orgId: params.orgId,
  });
  const addCustomRole = useAddCustomRole();

  if (getInitialPermissions.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (getInitialPermissions.isError) {
    throw new Error(getInitialPermissions.error.message);
  }

  const initialPermissions =
    getInitialPermissions.data?.data?.permissions || [];

  // Set all permissions to false initially
  const initialPermissionsWithDefaults = initialPermissions.map(
    (controller) => ({
      ...controller,
      apiPermissions: controller.apiPermissions.map((api) => ({
        ...api,
        isAllowed: false,
      })),
    })
  );

  const handleCreate = async (values: RolePermissionsSchemaType) => {
    // Filter permissions to only include isAllowed: true
    const filteredPermissions = values.permissions
      .map((controller) => ({
        ...controller,
        apiPermissions: controller.apiPermissions.filter(
          (api) => api.isAllowed === true
        ),
      }))
      .filter((controller) => controller.apiPermissions.length > 0);

    await addCustomRole.mutateAsync(
      {
        params: {
          orgId: params.orgId,
        },
        data: {
          orgId: params.orgId,
          roleName: values.roleName,
          roleDescription: values.roleDescription,
          tags: values.tags,
          permissions: filteredPermissions,
        },
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status === "SUCCESS" || data.status === "OK") {
            toast.success(t("create.success"));

            await queryClient.invalidateQueries({
              queryKey: getCustomRoles.key,
              refetchType: "active",
            });

            return router.back();
          }

          return toast.error(data.description);
        },
      }
    );
  };

  return (
    <RolePermissionsForm
      initialValue={{
        roleName: "",
        roleDescription: "",
        tags: "",
        permissions: initialPermissionsWithDefaults,
      }}
      isUpdate={false}
      onSubmit={handleCreate}
    />
  );
};

export default CreateRolePermissionsViewPage;
