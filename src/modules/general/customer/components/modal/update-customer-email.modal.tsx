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
import { useTranslation } from "react-i18next";
import { errorMessageAsLangKey } from "@/lib/utils";

interface UpdateCustomerEmailModalProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  mode: "verify" | "update";
  orgId: string;
  customerId: string;
  email: string;
}

const schema = z.object({
  email: z.email("form.validation.emailInvalid"),
});

type SchemaType = z.infer<typeof schema>;

export const UpdateCustomerEmailModal = ({
  isOpen,
  setOpen,
  mode,
  orgId,
  customerId,
  email,
}: UpdateCustomerEmailModalProps) => {
  const { t } = useTranslation("customer");
  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: email ?? "",
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
              toast.success(t("modal.updateSuccess"));

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
              toast.success(t("modal.verifySuccess", { email: values.email }));

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
      <DialogContent iconWhite>
        <DialogHeader className="bg-primary text-white rounded-t-lg -m-6 mb-0.5 p-4">
          <DialogTitle>
            {mode === "update" ? t("modal.updateEmailTitle") : t("modal.verifyEmailTitle")}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  label={t("modal.email")}
                  errorMessage={errorMessageAsLangKey(errors.email?.message, t)}
                  disabled={isSubmitting}
                  maxLength={80}
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
              {t("modal.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isPending={isSubmitting}
            >
              {t("modal.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
