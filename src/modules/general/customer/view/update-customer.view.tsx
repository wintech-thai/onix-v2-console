"use client";

import { useParams, useRouter } from "next/navigation";
import { CustomerForm } from "../components/customer-form/customer-form";
import { getCustomerApi } from "../api/get-customer.api";
import { Loader } from "lucide-react";
import { CustomerSchemaType } from "../schema/customer.schema";
import { updateCustomerApi } from "../api/update-customer.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCustomerApi } from "../api/fetch-customer.api";

const UpdateCustomerView = () => {
  const params = useParams<{ orgId: string; customerId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getCustomer = getCustomerApi.useGetCustomer(params);
  const updateCustomer = updateCustomerApi.useUpdateCustomer();

  if (getCustomer.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (getCustomer.isError) {
    throw new Error(getCustomer.error.message);
  }

  const customerPayload = getCustomer.data?.data;

  if (!customerPayload) {
    throw new Error("Customer Not Found");
  }

  const handleUpdate = async (values: CustomerSchemaType) => {
    await updateCustomer.mutateAsync(
      {
        orgId: params.orgId,
        customerId: params.customerId,
        values: values,
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status === "OK") {
            toast.success("Update Success");

            await queryClient.invalidateQueries({
              queryKey: fetchCustomerApi.key,
              refetchType: "active",
            });

            await queryClient.invalidateQueries({
              queryKey: [getCustomerApi.key],
              refetchType: "active"
            })

            return router.back();
          }

          return toast.error("Update Error");
        },
        onError: () => {
          toast.error("Update Error");
        }
      }
    );
  };

  return (
    <CustomerForm
      initialValue={{ ...customerPayload }}
      isUpdate
      onSubmit={handleUpdate}
    />
  );
};

export default UpdateCustomerView;
