"use client";

import { Controller, useForm } from "react-hook-form";
import {
  ScanItemsActionsSchemaType,
  useScanItemsActionsSchema,
} from "../../schema/scan-items-actions.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useConfirm } from "@/hooks/use-confirm";
import { useFormNavigationBlocker } from "@/hooks/use-form-navigation-blocker";
import { useTranslation } from "react-i18next";
import { errorMessageAsLangKey } from "@/lib/utils";
import { getScanItemActionsDefaultApi } from "../../api/get-default-sacns-items-action.api";
import { InputTags } from "@/components/ui/input-tags";

interface ScanItemsActionFormProps {
  onSubmit: (values: ScanItemsActionsSchemaType) => Promise<void>;
  initialValue: ScanItemsActionsSchemaType;
  isUpdate: boolean;
}

export const ScanItemsActionForm = ({
  onSubmit,
  initialValue,
  isUpdate,
}: ScanItemsActionFormProps) => {
  const { t } = useTranslation(["scan-items-action", "common"]);
  const scanItemsActionsSchema = useScanItemsActionsSchema();
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const form = useForm<ScanItemsActionsSchemaType>({
    resolver: zodResolver(scanItemsActionsSchema),
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

  // Get default values API
  const defaultValuesMutation =
    getScanItemActionsDefaultApi.useGetDefaultScanItemActions();

  // Sync form dirty state with navigation blocker
  useEffect(() => {
    setFormDirty(isDirty);
  }, [isDirty, setFormDirty]);

  const handleSetDefault = async () => {
    await defaultValuesMutation.mutateAsync(
      { orgId: params.orgId },
      {
        onSuccess: ({ data }) => {
          if (data) {
            const defaultData = data;
            form.setValue("themeVerify", defaultData.themeVerify || "", {
              shouldDirty: true,
              shouldValidate: true,
            });
            form.setValue("encryptionKey", defaultData.encryptionKey || "", {
              shouldDirty: true,
              shouldValidate: true,
            });
            form.setValue("encryptionIV", defaultData.encryptionIV || "", {
              shouldDirty: true,
              shouldValidate: true,
            });
            form.setValue("redirectUrl", defaultData.redirectUrl || "", {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        },
      }
    );
  };

  const handleSubmit = async (values: ScanItemsActionsSchemaType) => {
    if (!isDirty) {
      return router.back();
    }
    await onSubmit(values);
    form.reset();
    setFormDirty(false);
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
              name="actionName"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.generalInformation.actionName")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.actionName?.message,
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

        {/* Technical Information Section */}
        <div className="p-4 md:p-6 border rounded-lg">
          <div className="flex items-center justify-between">
            <header className="text-lg font-bold">
              {t("form.technicalInformation.title")}
            </header>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSetDefault}
              disabled={
                isSubmitting || isUpdate || defaultValuesMutation.isPending
              }
              isPending={defaultValuesMutation.isPending}
            >
              {t("form.defaultValue")}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Controller
              control={form.control}
              name="themeVerify"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.technicalInformation.themeVerify")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.themeVerify?.message,
                      t
                    )}
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                );
              }}
            />

            <Controller
              control={form.control}
              name="redirectUrl"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.technicalInformation.redirectUrl")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.redirectUrl?.message,
                      t
                    )}
                    maxLength={255}
                    disabled={isSubmitting}
                  />
                );
              }}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Controller
              control={form.control}
              name="encryptionKey"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.technicalInformation.encryptionKey")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.encryptionKey?.message,
                      t
                    )}
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                );
              }}
            />

            <Controller
              control={form.control}
              name="encryptionIV"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.technicalInformation.encryptionIV")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.encryptionIV?.message,
                      t
                    )}
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                );
              }}
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Controller
              control={form.control}
              name="registeredAwareFlag"
              render={({ field }) => {
                return (
                  <Checkbox
                    id="registeredAwareFlag"
                    checked={field.value === "YES"}
                    onCheckedChange={(checked) => {
                      field.onChange(checked ? "YES" : "NO");
                    }}
                    disabled={isSubmitting}
                  />
                );
              }}
            />
            <Label className="cursor-pointer" htmlFor="registeredAwareFlag">
              {t("form.technicalInformation.registeredAwareFlag")}
            </Label>
          </div>
          {errors.registeredAwareFlag?.message && (
            <span className="text-sm text-destructive">
              {errorMessageAsLangKey(errors.registeredAwareFlag.message, t)}
            </span>
          )}
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
