/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import z from "zod";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { scanItemThemplateSchema } from "../../schema/scan-item-themplate.schema";
import { scanItemThemplateApi } from "../../api/scan-item-themplete.api";
import { toast } from "sonner";

interface ScanItemTemplateModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type CreateScanItemTemplateType = z.infer<typeof scanItemThemplateSchema>;

export const ScanItemTemplateModal = ({
  children,
  open,
  onOpenChange,
}: ScanItemTemplateModalProps) => {
  const { t } = useTranslation();
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();

  const [internalOpen, setInternalOpen] = useState(false);
  // Form setup
  const form = useForm<CreateScanItemTemplateType>({
    resolver: zodResolver(scanItemThemplateSchema),
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
      toast.error(t("qrcode.scanItemTemplate.error.loadDefault"));
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
            onError: (error) => {
              toast.error(
                error.message || t("qrcode.scanItemTemplate.error.update")
              );
            },
            onSuccess: ({ data }) => {
              if (data.status !== "OK") {
                return toast.error(data.description || t("common.error"));
              }

              toast.success(t("qrcode.scanItemTemplate.success.update"));
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
            onError: (error) => {
              toast.error(
                error.message || t("qrcode.scanItemTemplate.error.create")
              );
            },
            onSuccess: ({ data }) => {
              if (data.status !== "OK") {
                return toast.error(data.description || t("common.error"));
              }

              toast.success(t("qrcode.scanItemTemplate.success.create"));
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

  const TextField = ({
    name,
    label,
    className = "w-full",
    isRequired = true,
    maxLength,
  }: {
    name: keyof CreateScanItemTemplateType;
    label: string;
    className?: string;
    isRequired?: boolean;
    maxLength?: number;
  }) => {
    const autoId = useId();
    const inputId = `scan-template-${String(name)}-${autoId}`;
    return (
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <Label isRequired={isRequired} htmlFor={inputId} className="w-40">
          {label}
        </Label>
        <div className="w-full">
          <Controller
            control={form.control}
            name={name}
            render={({ field }) => (
              <Input
                {...field}
                id={inputId}
                value={field.value as string}
                errorMessage={t(form.formState.errors[name]?.message as any)}
                className={className}
                disabled={isSubmitting || getScanItemDefaultMutation.isPending}
                maxLength={maxLength}
              />
            )}
          />
        </div>
      </div>
    );
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
            {t("qrcode.scanItemTemplate.title")}
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
              : t("qrcode.scanItemTemplate.buttons.defaultValue")}
          </Button>

          <div className="flex flex-col gap-2">
            {/* Serial Prefix Digit */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Label htmlFor="serialPrefixDigit" isRequired className="w-40">
                {t("qrcode.scanItemTemplate.fields.serialPrefixDigit")}
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
                      errorMessage={t(
                        form.formState.errors.serialPrefixDigit?.message as any
                      )}
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
            </div>

            {/* Serial Digit */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Label htmlFor="serialDigit" isRequired className="w-40">
                {t("qrcode.scanItemTemplate.fields.serialDigit")}
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
                      errorMessage={t(
                        form.formState.errors.serialDigit?.message as any
                      )}
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
                {t("qrcode.scanItemTemplate.fields.generatorCount")}
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
                      errorMessage={t(
                        form.formState.errors.generatorCount?.message as any
                      )}
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
                {t("qrcode.scanItemTemplate.fields.pinDigit")}
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
                      errorMessage={t(
                        form.formState.errors.pinDigit?.message as any
                      )}
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

            <TextField
              name="notificationEmail"
              label={t("qrcode.scanItemTemplate.fields.notificationEmail")}
              isRequired={false}
              maxLength={50}
              key={"notificationEmail"}
            />
            <TextField
              name="urlTemplate"
              label={t("qrcode.scanItemTemplate.fields.urlTemplate")}
              maxLength={80}
              key={"urlTemplate"}
            />
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
