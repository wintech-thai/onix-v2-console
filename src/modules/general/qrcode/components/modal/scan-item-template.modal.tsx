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
import { Button } from "@/components/ui/button";

import {
  ScanItemTemplateSchemaType,
  useScanItemThemplateSchema,
} from "../../schema/scan-item-themplate.schema";
import { scanItemThemplateApi } from "../../api/scan-item-themplete.api";
import { toast } from "sonner";

interface ScanItemTemplateModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type CreateScanItemTemplateType = ScanItemTemplateSchemaType;

export const ScanItemTemplateModal = ({
  children,
  open,
  onOpenChange,
}: ScanItemTemplateModalProps) => {
  const { t } = useTranslation(["common", "scan-item"]);
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();

  const [internalOpen, setInternalOpen] = useState(false);
  // Form setup
  const form = useForm<CreateScanItemTemplateType>({
    resolver: zodResolver(useScanItemThemplateSchema()),
    defaultValues: {
      serialPrefixDigit: 0,
      generatorCount: 0,
      serialDigit: 0,
      pinDigit: 0,
      urlTemplate: "",
      notificationEmail: "",
      createdDate: new Date().toISOString(),
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
  const { data: existingData } =
    scanItemThemplateApi.getScanItemThemplate.useQuery(params.orgId);
  const getScanItemDefaultMutation =
    scanItemThemplateApi.getScanItemThemplateDefault.useMutation();
  const addScanItemTemplateMutation =
    scanItemThemplateApi.addScanItemThemplate.useMutation();
  const updateScanItemTemplateMutation =
    scanItemThemplateApi.updateScanItemThemplate.useMutation();

  const hasExistingData = !!existingData?.data?.id;

  // Load existing data when modal opens
  useEffect(() => {
    if (existingData?.data && dialogOpen) {
      const data = existingData.data;
      form.reset({
        serialPrefixDigit: data.serialPrefixDigit,
        generatorCount: data.generatorCount,
        serialDigit: data.serialDigit,
        pinDigit: data.pinDigit,
        urlTemplate: data.urlTemplate,
        notificationEmail: data.notificationEmail || "",
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
        serialPrefixDigit: defaultData.serialPrefixDigit,
        generatorCount: defaultData.generatorCount,
        serialDigit: defaultData.serialDigit,
        pinDigit: defaultData.pinDigit,
        urlTemplate: defaultData.urlTemplate,
        notificationEmail: defaultData.notificationEmail || "",
        createdDate: defaultData.createdDate?.toString() || "",
      });
    } catch (error) {
      console.error("Error loading default values:", error);
      toast.error(t("scan-item:scanItemTemplate.error.loadDefault"));
    }
  };

  const handleSubmit = async (formData: CreateScanItemTemplateType) => {
    try {
      if (hasExistingData) {
        await updateScanItemTemplateMutation.mutateAsync(
          {
            value: formData as CreateScanItemTemplateType,
            orgId: params.orgId,
            itemId: existingData?.data?.id || "",
          },
          {
            onSuccess: ({ data }) => {
              if (data.status !== "OK") {
                return toast.error(data.description || t("common.error"));
              }

              toast.success(t("scan-item:scanItemTemplate.success.update"));
              handleClose(false);
            },
          }
        );
      } else {
        await addScanItemTemplateMutation.mutateAsync(
          {
            value: formData,
            orgId: params.orgId,
          },
          {
            onSuccess: ({ data }) => {
              if (data.status !== "OK") {
                return toast.error(data.description || t("common.error"));
              }

              toast.success(t("scan-item:scanItemTemplate.success.create"));
              handleClose(false);
            },
          }
        );
      }

      await queryClient.invalidateQueries({
        queryKey: [scanItemThemplateApi.getScanItemThemplate.key, params.orgId],
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
            {t("scan-item:scanItemTemplate.title")}
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
              ? t("common.loading")
              : t("scan-item:scanItemTemplate.buttons.defaultValue")}
          </Button>

          <div className="flex flex-col gap-2">
            {/* Serial Prefix Digit */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 relative">
              <Label htmlFor="serialPrefixDigit" isRequired className="w-40">
                {t("scan-item:scanItemTemplate.fields.serialPrefixDigit")}
              </Label>
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="serialPrefixDigit"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="serialPrefixDigit"
                      type="text"
                      value={
                        field.value === 0 ||
                        field.value == null ||
                        field.value === undefined
                          ? ""
                          : String(field.value)
                      }
                      inputMode="numeric"
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          field.onChange(0);
                          return;
                        }

                        const number = Number(value);
                        if (isNaN(number)) return;
                        field.onChange(number);
                      }}
                      errorMessage={
                        form.formState.errors.serialPrefixDigit?.message
                      }
                      className="w-full md:w-1/2"
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      min={2}
                      max={3}
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
                  ? t("common.loading")
                  : t("scan-item:scanItemTemplate.buttons.defaultValue")}
              </Button>
            </div>

            {/* Serial Digit */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Label htmlFor="serialDigit" isRequired className="w-40">
                {t("scan-item:scanItemTemplate.fields.serialDigit")}
              </Label>
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="serialDigit"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="serialDigit"
                      type="text"
                      value={
                        field.value === 0 ||
                        field.value == null ||
                        field.value === undefined
                          ? ""
                          : String(field.value)
                      }
                      inputMode="numeric"
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          field.onChange(0);
                          return;
                        }

                        const number = Number(value);
                        if (isNaN(number)) return;
                        field.onChange(number);
                      }}
                      errorMessage={form.formState.errors.serialDigit?.message}
                      className="w-full md:w-1/2"
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      min={7}
                      max={9}
                    />
                  )}
                />
              </div>
            </div>

            {/* Generator Count */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Label htmlFor="generatorCount" isRequired className="w-40">
                {t("scan-item:scanItemTemplate.fields.generatorCount")}
              </Label>
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="generatorCount"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="generatorCount"
                      type="text"
                      value={
                        field.value === 0 ||
                        field.value == null ||
                        field.value === undefined
                          ? ""
                          : String(field.value)
                      }
                      inputMode="numeric"
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          field.onChange(0);
                          return;
                        }

                        const number = Number(value);
                        if (isNaN(number)) return;
                        field.onChange(number);
                      }}
                      errorMessage={
                        form.formState.errors.generatorCount?.message
                      }
                      className="w-full md:w-1/2"
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      min={1}
                    />
                  )}
                />
              </div>
            </div>

            {/* Pin Digit */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Label htmlFor="pinDigit" isRequired className="w-40">
                {t("scan-item:scanItemTemplate.fields.pinDigit")}
              </Label>
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="pinDigit"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="pinDigit"
                      type="text"
                      value={
                        field.value === 0 ||
                        field.value == null ||
                        field.value === undefined
                          ? ""
                          : String(field.value)
                      }
                      inputMode="numeric"
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          field.onChange(0);
                          return;
                        }

                        const number = Number(value);
                        if (isNaN(number)) return;
                        field.onChange(number);
                      }}
                      errorMessage={form.formState.errors.pinDigit?.message}
                      className="w-full md:w-1/2"
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      min={7}
                      max={9}
                    />
                  )}
                />
              </div>
            </div>

            {/* Notification Email & URL Template */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Label isRequired={false} className="w-40">
                {t("scan-item:scanItemTemplate.fields.notificationEmail")}
              </Label>
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="notificationEmail"
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value as string}
                      errorMessage={
                        form.formState.errors.notificationEmail?.message
                      }
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      maxLength={50}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Label isRequired className="w-40">
                {t("scan-item:scanItemTemplate.fields.urlTemplate")}
              </Label>
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="urlTemplate"
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value as string}
                      errorMessage={form.formState.errors.urlTemplate?.message}
                      disabled={
                        isSubmitting || getScanItemDefaultMutation.isPending
                      }
                      maxLength={80}
                    />
                  )}
                />
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
