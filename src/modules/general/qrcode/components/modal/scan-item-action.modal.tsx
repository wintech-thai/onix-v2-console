import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import z from "zod";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { scanItemActionSchema } from "../../schema/scan-item-action.schema";
import { scanItemActionApi } from "../../api/scan-item-actions";
import { toast } from "sonner";

interface ScanItemActionModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type CreateScanItemActionType = z.infer<typeof scanItemActionSchema>;

export const ScanItemActionModal = ({
  children,
  open,
  onOpenChange,
}: ScanItemActionModalProps) => {
  const { t } = useTranslation();
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();

  const [internalOpen, setInternalOpen] = useState(false);
  // Form setup
  const form = useForm<CreateScanItemActionType>({
    resolver: zodResolver(scanItemActionSchema),
    defaultValues: {
      redirectUrl: "",
      encryptionKey: "",
      encryptionIV: "",
      themeVerify: "",
      registeredAwareFlag: "FALSE",
      createdDate: "",
    },
  });
  const errors = form.formState.errors;
  console.log('errors', errors);

  const isSubmitting = form.formState.isSubmitting;
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const dialogOnOpenChange = isControlled ? onOpenChange : setInternalOpen;

  const handleClose = (value: boolean) => {
    if (value === false) {
      form.reset();
      form.clearErrors();
    }
    dialogOnOpenChange(value);
  };

  // API hooks
  const { data: existingData } = scanItemActionApi.getScanItemAction.useQuery(
    params.orgId
  );
  const getScanItemDefaultMutation =
    scanItemActionApi.getScanItemDefault.useMutation();
  const addScanItemActionMutation =
    scanItemActionApi.addScanItemAction.useMutation();
  const updateScanItemActionMutation =
    scanItemActionApi.updateScanItemAction.useMutation();

  const hasExistingData = !!existingData?.data?.id;

  // Load existing data when modal opens
  useEffect(() => {
    if (existingData?.data && dialogOpen) {
      const data = existingData.data;
      form.reset({
        redirectUrl: data.redirectUrl,
        encryptionKey: data.encryptionKey,
        encryptionIV: data.encryptionIV,
        themeVerify: data.themeVerify,
        registeredAwareFlag: data.registeredAwareFlag,
        createdDate: data.createdDate?.toString() || "",
      });
    }
  }, [existingData, dialogOpen, form]);

  const handleLoadDefaultValues = async () => {
    try {
      const response = await getScanItemDefaultMutation.mutateAsync(
        params.orgId
      );
      const defaultData = response.data;

      form.reset({
        redirectUrl: defaultData.redirectUrl,
        encryptionKey: defaultData.encryptionKey,
        encryptionIV: defaultData.encryptionIV,
        themeVerify: defaultData.themeVerify,
        registeredAwareFlag: defaultData.registeredAwareFlag,
        createdDate: defaultData.createdDate?.toString() || "",
      });
    } catch (error) {
      console.error("Error loading default values:", error);
      toast.error(t("qrcode.scanItemAction.error.loadDefault"));
    }
  };

  const handleSubmit = async (formData: CreateScanItemActionType) => {
    try {
      if (hasExistingData) {
        await updateScanItemActionMutation.mutateAsync(
          {
            value: formData,
            orgId: params.orgId,
            itemId: existingData?.data?.id || "",
          },
          {
            onError: (error) => {
              toast.error(error.message || t("qrcode.scanItemAction.error.update"));
            },
            onSuccess: ({ data }) => {
              if (data.status !== "OK") {
                return toast.error(data.description || t("common.error"));
              }

              toast.success(t("qrcode.scanItemAction.success.update"));
              handleClose(false);
            },
          }
        );
      } else {
        await addScanItemActionMutation.mutateAsync(
          {
            value: formData,
            orgId: params.orgId,
          },
          {
            onError: (error) => {
              toast.error(error.message || t("qrcode.scanItemAction.error.create"));
            },
            onSuccess: ({ data }) => {
              if (data.status !== "OK") {
                return toast.error(data.description || t("common.error"));
              }

              toast.success(t("qrcode.scanItemAction.success.create"));
              handleClose(false);
            },
          }
        );
      }

      await queryClient.invalidateQueries({
        queryKey: [scanItemActionApi.getScanItemAction.key, params.orgId],
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const FormField = ({
    name,
    label,
    className = "w-full md:w-1/2",
    maxLength = 10,
  }: {
    name: keyof CreateScanItemActionType;
    label: string;
    className?: string;
    maxLength: number;
  }) => (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <Label isRequired={name !== "themeVerify"} className="w-32">
        {label}
      </Label>
      <div className="w-full">
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <Input
              {...field}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              errorMessage={t(form.formState.errors[name]?.message as any)}
              className={className}
              disabled={isSubmitting || getScanItemDefaultMutation.isPending}
              maxLength={maxLength}
              minLength={name === "encryptionKey" || name === "encryptionIV" ? maxLength : undefined}
            />
          )}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={handleClose}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent iconWhite className="w-full md:max-w-2xl p-6">
        <DialogHeader
          className="
            bg-primary text-white rounded-t-lg -m-6 mb-4 p-4
          "
        >
          <DialogTitle className="text-xl font-bold mb-2">
            {t("qrcode.scanItemAction.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 px-3 ml-auto flex"
            onClick={handleLoadDefaultValues}
            disabled={getScanItemDefaultMutation.isPending || isSubmitting}
          >
            {getScanItemDefaultMutation.isPending
              ? t("common.loading")
              : t("qrcode.scanItemAction.buttons.defaultValue")}
          </Button>

          <div className="flex flex-col gap-2">
            <FormField maxLength={16} name="encryptionKey" label={t("qrcode.scanItemAction.fields.key")} />
            <FormField maxLength={16} name="encryptionIV" label={t("qrcode.scanItemAction.fields.iv")} />
            <FormField maxLength={15} name="themeVerify" label={t("qrcode.scanItemAction.fields.theme")} />
            <FormField
              maxLength={80}
              name="redirectUrl"
              label={t("qrcode.scanItemAction.fields.redirectUrl")}
              className="w-full"
            />

            <div className="flex items-center gap-3">
              <div className="w-32 hidden md:block" />
              <div className="flex items-center gap-2 w-full">
                <Controller
                  control={form.control}
                  name="registeredAwareFlag"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value === "TRUE"}
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "TRUE" : "FALSE")
                      }
                    />
                  )}
                />
                <span>{t("qrcode.scanItemAction.fields.rescanCheck")}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting || getScanItemDefaultMutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={getScanItemDefaultMutation.isPending}
              isPending={isSubmitting}
            >
              {t("common.ok")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
