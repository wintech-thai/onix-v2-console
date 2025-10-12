import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { createScanItemsSchema } from "../../schema/create-scan-items.schema";
import z from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { createScanItemsApi } from "../../api/create-scan-items";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { errorMessageAsLangKey } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { fetchScanItemsApi } from "../../api/fetch-qrcodes.api";

type CreateScanItemType = z.infer<typeof createScanItemsSchema>;

interface CreateScanItemModalProps {
  children: React.ReactNode;
}

export const CreateScanItemModal = ({ children }: CreateScanItemModalProps) => {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();

  const form = useForm<CreateScanItemType>({
    resolver: zodResolver(createScanItemsSchema),
    defaultValues: {
      serial: "",
      pin: "",
    },
  });
  const errors = form.formState.errors;
  const isSubmitting = form.formState.isSubmitting;

  const createScanItem = createScanItemsApi.useCreateScanItemsMutation();

  const handleSubmit = async (values: CreateScanItemType) => {
    try {
      await createScanItem.mutateAsync(
        {
          serial: values.serial,
          pin: values.pin,
          orgId: params.orgId,
        },
        {
          onSuccess: ({ data }) => {
            if (data.status !== "OK") {
              if (data.status === "PIN_ALREADY_EXIST") {
                return toast.error(
                  t("qrcode.create.validation.pinDuplicate", {
                    pin: values.pin,
                  })
                );
              } else if (data.status === "SERIAL_ALREADY_EXIST") {
                return toast.error(
                  t("qrcode.create.validation.serialDuplicate", {
                    serial: values.serial,
                  })
                );
              }
              return toast.error(data.description);
            }

            toast.success(
              t("qrcode.create.success", "Scan item created successfully")
            );

            queryClient.invalidateQueries({
              queryKey: fetchScanItemsApi.fetchScanItemsKey,
              refetchType: "active",
            });
            handleClose(false);
          },
          onError: () => {
            toast.error(t("qrcode.create.error", "Failed to create scan item"));
          },
        }
      );
    } catch (error) {
      console.error("Error creating scan item:", error);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      form.clearErrors();
      buttonRef.current?.click();
    }
  };

  return (
    <Dialog onOpenChange={handleClose}>
      <DialogClose ref={buttonRef} />
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent iconWhite>
        <DialogHeader className="bg-primary text-white rounded-t-lg -m-6 mb-4 p-4">
          <DialogTitle className="text-lg font-semibold">
            {t("qrcode.create.title", "Create Scan Item")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="serial"
            render={({ field }) => (
              <Input
                {...field}
                label={t("qrcode.create.fields.serial", "Serial")}
                errorMessage={errorMessageAsLangKey(errors.serial?.message, t)}
                disabled={isSubmitting}
                maxLength={10}
              />
            )}
          />
          <Controller
            control={form.control}
            name="pin"
            render={({ field }) => (
              <Input
                {...field}
                label={t("qrcode.create.fields.pin", "Pin")}
                errorMessage={errorMessageAsLangKey(errors.pin?.message, t)}
                disabled={isSubmitting}
                maxLength={10}
              />
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button isPending={isSubmitting} type="submit">
              {t("common.ok")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
