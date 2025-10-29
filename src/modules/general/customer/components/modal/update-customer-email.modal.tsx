import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { updateCustomerEmailApi } from "../../api/update-customer-email.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCustomerApi } from "../../api/fetch-customer.api";
import { getCustomerApi } from "../../api/get-customer.api";

interface UpdateCustomerEmailModalProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  mode: "verify" | "update";
  orgId: string;
  customerId: string;
}

const schema = z.object({
  email: z.email(),
});

type SchemaType = z.infer<typeof schema>;

export const UpdateCustomerEmailModal = ({
  isOpen,
  setOpen,
  mode,
  orgId,
  customerId,
}: UpdateCustomerEmailModalProps) => {
  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const queryClient = useQueryClient();

  const { errors, isSubmitting } = form.formState;

  const updateCustomerEmail =
    updateCustomerEmailApi.useUpdateUpdateCustomerEmail();
  const updateCustomerEmailVerify =
    updateCustomerEmailApi.useUpdateVerifyCustomerEmail();

  const handleSubmit = async (values: SchemaType) => {
    if (mode === "update") {
      return await updateCustomerEmail.mutateAsync(
        {
          customerId,
          email: values.email,
          orgId,
        },
        {
          onSuccess: async ({ data }) => {
            if (data.status === "OK") {
              toast.success("Update Email Success");

              await queryClient.invalidateQueries({
                queryKey: fetchCustomerApi.key,
                refetchType: "active",
              });

              await queryClient.invalidateQueries({
                queryKey: [getCustomerApi.key],
                refetchType: "active",
              });

              return setOpen(false);
            }

            return toast.error(data.description);
          },
          onError: () => {
            toast.error("Update Error");
          },
        }
      );
    }

    if (mode === "verify") {
      return await updateCustomerEmailVerify.mutateAsync(
        {
          customerId,
          email: values.email,
          orgId,
        },
        {
          onSuccess: async ({ data }) => {
            if (data.status === "OK") {
              toast.success(`send email to ${values.email}`);

              await queryClient.invalidateQueries({
                queryKey: fetchCustomerApi.key,
                refetchType: "active",
              });

              await queryClient.invalidateQueries({
                queryKey: [getCustomerApi.key],
                refetchType: "active",
              });

              return setOpen(false);
            }

            return toast.error(data.description);
          },
          onError: () => {
            toast.error("Update Error");
          },
        }
      );
    }
  };

  const onClose = (isOpen: boolean) => {
    setOpen(isOpen);
    form.reset();
    form.clearErrors();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Customer Email</DialogTitle>
        </DialogHeader>

        <form className="space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  errorMessage={errors.email?.message}
                  disabled={isSubmitting}
                />
              );
            }}
          />

          <div className="justify-end flex items-center gap-x-2">
            <Button
              variant="destructive"
              type="button"
              onClick={() => onClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isPending={isSubmitting}
            >
              SAVE
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
