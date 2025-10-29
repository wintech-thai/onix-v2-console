"use client";

import { useParams, useRouter } from "next/navigation";
import { CustomerForm } from "../components/customer-form/customer-form";
import { createCustomerApi } from "../api/create-customer.api";
import { CustomerSchemaType } from "../schema/customer.schema";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCustomerApi } from "../api/fetch-customer.api";
import { toast } from "sonner";

const CreateCustomerView = () => {
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createCustomer = createCustomerApi.useCreateCustomer();

  const handleCreateUser = async (values: CustomerSchemaType) => {
    await createCustomer.mutateAsync(
      {
        orgId: params.orgId,
        values: values,
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status === "OK") {
            toast.success("Create Success");

            await queryClient.invalidateQueries({
              queryKey: fetchCustomerApi.key,
              refetchType: "active",
            });

            return router.back();
          }

          return toast.error("Create Error");
        },
        onError: () => {
          toast.error("Create Error");
        },
      }
    );
  };

  return (
    <CustomerForm
      initialValue={{
        code: "",
        content: "",
        name: "",
        primaryEmail: "",
        tags: "",
      }}
      isUpdate={false}
      onSubmit={handleCreateUser}
    />
  );
};

export default CreateCustomerView;
