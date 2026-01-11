"use client";

import { useParams, useRouter } from "next/navigation";
import { RolePermissionsForm } from "../components/role-permissions-form/role-permissions-form";
import { RolePermissionsSchemaType } from "../schema/role-permissions.schema";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  useGetCustomRoleById,
  useUpdateCustomRole,
} from "../hooks/role-permissions-hooks";
import { Loader } from "lucide-react";
import { getCustomRoles } from "../api/role-permissions.service";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const UpdateRolePermissionsViewPage = () => {
  const { t } = useTranslation("role-permissions");
  const params = useParams<{ orgId: string; permissionsId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getCustomRole = useGetCustomRoleById({
    orgId: params.orgId,
    id: params.permissionsId,
  });
  const updateCustomRole = useUpdateCustomRole();

  if (getCustomRole.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (getCustomRole.isError) {
    if (getCustomRole.error?.response?.status === 403) {
      return <NoPermissionsPage errors={getCustomRole.error} />;
    }
    throw new Error(getCustomRole.error.message);
  }

  const roleData = getCustomRole.data?.data?.customRole;

  if (!roleData) {
    throw new Error(t("update.notFound"));
  }

  const handleUpdate = async (values: RolePermissionsSchemaType) => {
    // Filter permissions to only include isAllowed: true
    const filteredPermissions = values.permissions
      .map((controller) => ({
        ...controller,
        apiPermissions: controller.apiPermissions.filter(
          (api) => api.isAllowed === true
        ),
      }))
      .filter((controller) => controller.apiPermissions.length > 0);

    await updateCustomRole.mutateAsync(
      {
        params: {
          orgId: params.orgId,
          customRoleId: params.permissionsId,
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
            toast.success(t("update.success"));

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
        roleName: roleData.roleName,
        roleDescription: roleData.roleDescription,
        tags: roleData.tags,
        permissions: roleData.permissions,
      }}
      isUpdate
      onSubmit={handleUpdate}
    />
  );
};

export default UpdateRolePermissionsViewPage;
