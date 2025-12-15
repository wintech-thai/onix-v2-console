"use client";

import { Controller, useForm } from "react-hook-form";
import {
  ScanItemTemplateSchemaType,
  scanItemTemplateSchema,
} from "../../schema/scan-items-templates.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useFormNavigationBlocker } from "@/hooks/use-form-navigation-blocker";
import { useTranslation } from "react-i18next";
import { errorMessageAsLangKey } from "@/lib/utils";
import { InputTags } from "@/components/ui/input-tags";

interface ScanItemTemplateFormProps {
  onSubmit: (values: ScanItemTemplateSchemaType, callback: () => void) => Promise<void>;
  initialValue: ScanItemTemplateSchemaType;
  isUpdate: boolean;
}

export const ScanItemTemplateForm = ({
  onSubmit,
  initialValue,
  isUpdate,
}: ScanItemTemplateFormProps) => {
  const { t } = useTranslation(["scan-items-template", "common"]);
  const router = useRouter();
  const form = useForm<ScanItemTemplateSchemaType>({
    resolver: zodResolver(scanItemTemplateSchema),
    defaultValues: initialValue,
  });
  const { setFormDirty } = useFormNavigationBlocker();

  const [ConfirmBack, confirmBack] = useConfirm({
    message: t("common:form.unsavedChanges"),
    title: t("common:form.leavePage"),
    variant: "destructive",
  });

  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;
  const errors = form.formState.errors;

  // Sync form dirty state with navigation blocker
  useEffect(() => {
    setFormDirty(isDirty);
  }, [isDirty, setFormDirty]);

  const handleSubmit = async (values: ScanItemTemplateSchemaType) => {
    if (!isDirty) {
      return router.back();
    }
    await onSubmit(values, () => {
      form.reset();
      setFormDirty(false);
    });
  };

  const handleCancel = async () => {
    if (!isDirty) {
      setFormDirty(false);
      return router.back();
    }

    const ok = await confirmBack();

    if (ok) {
      form.reset();
      form.clearErrors();
      setFormDirty(false);
      router.back();
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="h-full flex flex-col"
    >
      <ConfirmBack />

      <header className="p-4 border border-b">
        <h1 className="text-lg font-bold">
          <ArrowLeftIcon
            onClick={handleCancel}
            className="inline cursor-pointer"
          />{" "}
          {isUpdate ? t("form.updateTitle") : t("form.createTitle")}
        </h1>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* General Information Section */}
        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">
            {t("form.generalInformation.title")}
          </header>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Controller
              control={form.control}
              name="templateName"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.generalInformation.templateName")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.templateName?.message,
                      t
                    )}
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                );
              }}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.generalInformation.description")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.description?.message,
                      t
                    )}
                    maxLength={255}
                    disabled={isSubmitting}
                  />
                );
              }}
            />
          </div>

          <Controller
            control={form.control}
            name="tags"
            render={({ field }) => (
              <InputTags
                label={t("form.generalInformation.tags")}
                placeholder={t("form.generalInformation.tagsPlaceholder")}
                errorMessage={errorMessageAsLangKey(errors.tags?.message, t)}
                maxLength={50}
                disabled={isSubmitting}
                isRequired
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  form.trigger("tags");
                }}
                onValidate={() => form.trigger("tags")}
              />
            )}
          />
        </div>

        {/* Template Configuration Section */}
        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">
            {t("form.templateConfiguration.title")}
          </header>

          <div className="grid md:grid-cols-1 gap-4 mt-4">
            <Controller
              control={form.control}
              name="urlTemplate"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.templateConfiguration.urlTemplate")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.urlTemplate?.message,
                      t
                    )}
                    maxLength={500}
                    disabled={isSubmitting}
                  />
                );
              }}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Controller
              control={form.control}
              name="serialPrefixDigit"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    value={field.value === 0 ? "" : field.value}
                    type="number"
                    label={t("form.templateConfiguration.serialPrefixDigit")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.serialPrefixDigit?.message,
                      t
                    )}
                    disabled={isSubmitting}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    min={0}
                  />
                );
              }}
            />

            <Controller
              control={form.control}
              name="pinDigit"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    value={field.value === 0 ? "" : field.value}
                    type="number"
                    label={t("form.templateConfiguration.pinDigit")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.pinDigit?.message,
                      t
                    )}
                    disabled={isSubmitting}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    min={0}
                  />
                );
              }}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Controller
              control={form.control}
              name="serialDigit"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    value={field.value === 0 ? "" : field.value}
                    type="number"
                    label={t("form.templateConfiguration.serialDigit")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.serialDigit?.message,
                      t
                    )}
                    disabled={isSubmitting}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    min={0}
                  />
                );
              }}
            />

            <Controller
              control={form.control}
              name="generatorCount"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    value={field.value === 0 ? "" : field.value}
                    type="number"
                    label={t("form.templateConfiguration.generatorCount")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.generatorCount?.message,
                      t
                    )}
                    disabled={isSubmitting}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    min={0}
                  />
                );
              }}
            />
          </div>

          <div className="grid md:grid-cols-1 gap-4 mt-4">
            <Controller
              control={form.control}
              name="notificationEmail"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    type="email"
                    label={t("form.templateConfiguration.notificationEmail")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.notificationEmail?.message,
                      t
                    )}
                    maxLength={255}
                    disabled={isSubmitting}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="p-4 border-t flex justify-end gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={isSubmitting}
          onClick={handleCancel}
        >
          {t("form.actions.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              {t("form.actions.saving")}
            </>
          ) : (
            t("form.actions.save")
          )}
        </Button>
      </footer>
    </form>
  );
};
