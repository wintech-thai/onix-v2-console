"use client";

import { useParams, useRouter } from "next/navigation";
import { PrivilegeForm } from "../components/privilege-form/privilege-form";
import { PrivilegesSchemaType } from "../schema/privileges.schema";
import { createPrivilegesApi } from "../api/create-privileges.api";
import { toast } from "sonner";

const CreatePrivilegesViewPage = () => {
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const createPrivilege = createPrivilegesApi.useCreatePrivileges();

  const initialValue: PrivilegesSchemaType = {
    code: "",
    description: "",
    tags: "",
    status: "Pending",
    effectiveDate: null,
    expireDate: null,
    content: "",
    pointRedeem: 0,
  };

  const handleSubmit = async (values: PrivilegesSchemaType) => {
    const toastId = toast.loading("Creating...");

    try {
      await createPrivilege.mutateAsync(
        {
          orgId: params.orgId,
          values,
        },
        {
          onSuccess: ({ data }) => {
            if (data.status !== "OK" && data.status !== "SUCCESS") {
              return toast.error(
                data.description || "Failed to create privilege",
                {
                  id: toastId,
                }
              );
            }

            toast.success("Privilege created successfully", { id: toastId });
            router.back();
          },
        }
      );
    } catch (error) {
      console.error("Create privilege error:", error);
      toast.error("Failed to create privilege", { id: toastId });
    }
  };

  return (
    <PrivilegeForm
      onSubmit={handleSubmit}
      initialValue={initialValue}
      isUpdate={false}
    />
  );
};

export default CreatePrivilegesViewPage;
