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

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import {
  useScanItemActionSchema,
  type ScanItemActionSchemaType,
} from "../../schema/scan-item-action.schema";
import { scanItemActionApi } from "../../api/scan-item-actions";
import { toast } from "sonner";

interface ScanItemActionModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ScanItemActionModal = ({
  children,
  open,
  onOpenChange,
}: ScanItemActionModalProps) => {
  const { t } = useTranslation(["scan-item", "common"]);
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();

  const scanItemActionSchema = useScanItemActionSchema();

  const [internalOpen, setInternalOpen] = useState(false);
  // Form setup
  const form = useForm<ScanItemActionSchemaType>({
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
      toast.error(t("scan-item:scanItemAction.error.loadDefault"));
    }
  };

  const handleSubmit = async (formData: ScanItemActionSchemaType) => {
    try {
      if (hasExistingData) {
        await updateScanItemActionMutation.mutateAsync(
          {
            value: formData,
            orgId: params.orgId,
            itemId: existingData?.data?.id || "",
          },
          {
            onSuccess: ({ data }) => {
              if (data.status !== "OK") {
                return toast.error(
                  data.description || t("common:common.error")
                );
              }

              toast.success(t("scan-item:scanItemAction.success.update"));
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
            onSuccess: ({ data }) => {
              if (data.status !== "OK") {
                return toast.error(
                  data.description || t("common:common.error")
                );
              }

              toast.success(t("scan-item:scanItemAction.success.create"));
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
            {t("scan-item:scanItemAction.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 px-3 ml-auto flex md:hidden"
            onClick={handleLoadDefaultValues}
            disabled={getScanItemDefaultMutation.isPending || isSubmitting}
          >
            {getScanItemDefaultMutation.isPending
              ? t("common:common.loading")
              : t("scan-item:scanItemAction.buttons.defaultValue")}
          </Button>

          <div className="flex flex-col gap-2">
            {/* Encryption Key */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 relative">
              <Label isRequired className="w-32">
                {t("scan-item:scanItemAction.fields.key")}
              </Label>
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="encryptionKey"
                  render={({ field }) => (
                    <Input
                      {...field}
                      errorMessage={
                        form.formState.errors.encryptionKey?.message
                      }
                      className="w-full md:w-1/2"
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      maxLength={16}
                    />
                  )}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-12 px-3 hidden md:flex absolute right-0"
                onClick={handleLoadDefaultValues}
                disabled={getScanItemDefaultMutation.isPending || isSubmitting}
              >
                {getScanItemDefaultMutation.isPending
                  ? t("common:common.loading")
                  : t("scan-item:scanItemAction.buttons.defaultValue")}
              </Button>
            </div>

            {/* Encryption IV */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Label isRequired className="w-32">
                {t("scan-item:scanItemAction.fields.iv")}
              </Label>
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="encryptionIV"
                  render={({ field }) => (
                    <Input
                      {...field}
                      errorMessage={form.formState.errors.encryptionIV?.message}
                      className="w-full md:w-1/2"
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      maxLength={16}
                    />
                  )}
                />
              </div>
            </div>

            {/* Theme Verify */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Label className="w-32">
                {t("scan-item:scanItemAction.fields.theme")}
              </Label>
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="themeVerify"
                  render={({ field }) => (
                    <Input
                      {...field}
                      errorMessage={form.formState.errors.themeVerify?.message}
                      className="w-full md:w-1/2"
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      maxLength={15}
                    />
                  )}
                />
              </div>
            </div>

            {/* Redirect URL */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Label isRequired className="w-32">
                {t("scan-item:scanItemAction.fields.redirectUrl")}
              </Label>
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="redirectUrl"
                  render={({ field }) => (
                    <Input
                      {...field}
                      errorMessage={form.formState.errors.redirectUrl?.message}
                      className="w-full"
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      maxLength={80}
                    />
                  )}
                />
              </div>
            </div>

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
                <span>{t("scan-item:scanItemAction.fields.rescanCheck")}</span>
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
              {t("common:common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={getScanItemDefaultMutation.isPending}
              isPending={isSubmitting}
            >
              {t("common:common.ok")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
