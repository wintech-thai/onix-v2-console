"use client";

import { useParams, useRouter } from "next/navigation";
import { PrivilegeForm } from "../components/privilege-form/privilege-form";
import { getPrivilegesApi } from "../api/get-privileges.api";
import { Loader } from "lucide-react";
import { updatePrivilegesApi } from "../api/update-privileges.api";
import { PrivilegesSchemaType } from "../schema/privileges.schema";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchPrivilegesApi } from "../api/fetch-privileges.api";
import { useTranslation } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const UpdatePrivilegesViewPage = () => {
  const { t } = useTranslation("privileges");
  const params = useParams<{ orgId: string; privilegeId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getPrivilege = getPrivilegesApi.useGetPrivileges(params);

  const updatePrivilegeMutation = updatePrivilegesApi.useCreatePrivileges();

  if (getPrivilege.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (getPrivilege.isError) {
    if (getPrivilege.error.response?.status === 403) {
      return <NoPermissionsPage apiName="GetPrivilegeById" />;
    }

    throw new Error(getPrivilege.error.message);
  }

  const privilegePayload = getPrivilege.data?.data;

  if (!privilegePayload) {
    throw new Error("Privilege Not Found");
  }

  const handleUpdatePrivilege = async (values: PrivilegesSchemaType) => {
    await updatePrivilegeMutation.mutateAsync(
      {
        orgId: params.orgId,
        privilegeId: params.privilegeId,
        values,
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status === "OK" || data.status === "SUCCESS") {
            await queryClient.invalidateQueries({
              queryKey: [getPrivilegesApi.key],
              refetchType: "active",
            });

            await queryClient.invalidateQueries({
              queryKey: fetchPrivilegesApi.key,
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
    <PrivilegeForm
      initialValue={{
        code: privilegePayload.code || "",
        description: privilegePayload.description || "",
        tags: privilegePayload.tags || "",
        status: privilegePayload.status || "Pending",
        effectiveDate: privilegePayload.effectiveDate || null,
        expireDate: privilegePayload.expireDate || null,
        content: privilegePayload.content || "",
        pointRedeem: privilegePayload.pointRedeem ?? 0,
      }}
      isUpdate
      onSubmit={handleUpdatePrivilege}
    />
  );
};

export default UpdatePrivilegesViewPage;
