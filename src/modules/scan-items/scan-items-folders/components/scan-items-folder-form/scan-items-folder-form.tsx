import { Controller, useForm } from "react-hook-form";
import {
  scanItemsFolderSchema,
  ScanItemsFolderSchemaType,
} from "../../schema/scan-items-folders.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InputTags } from "@/components/ui/input-tags";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useFormNavigationBlocker } from "@/hooks/use-form-navigation-blocker";
import { useTranslation } from "react-i18next";
import { errorMessageAsLangKey } from "@/lib/utils";

interface ScanItemsFolderFormProps {
  onSubmit: (values: ScanItemsFolderSchemaType) => Promise<void>;
  initialValue: ScanItemsFolderSchemaType;
  isUpdate: boolean;
}

export const ScanItemsFolderForm = ({
  onSubmit,
  initialValue,
  isUpdate,
}: ScanItemsFolderFormProps) => {
  const { t } = useTranslation("scan-items-folder");
  const router = useRouter();
  const form = useForm<ScanItemsFolderSchemaType>({
    resolver: zodResolver(scanItemsFolderSchema),
    defaultValues: initialValue,
  });
  const { setFormDirty } = useFormNavigationBlocker();

  const [ConfirmBack, confirmBack] = useConfirm({
    message: t("form.unsavedChanges"),
    title: t("form.leavePage"),
    variant: "destructive",
  });

  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;
  const errors = form.formState.errors;

  // Sync form dirty state with navigation blocker
  useEffect(() => {
    setFormDirty(isDirty);
  }, [isDirty, setFormDirty]);

  const handleSubmit = async (values: ScanItemsFolderSchemaType) => {
    if (!isDirty) {
      return router.back();
    }
    await onSubmit(values);

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
        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">
            {t("form.generalInformation.title")}
          </header>

          {/* Folder Name (w-1/2) */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Controller
              control={form.control}
              name="folderName"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.generalInformation.folderName")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.folderName?.message,
                      t
                    )}
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                );
              }}
            />
          </div>

          {/* Description (w-full) */}
          <div className="mt-4">
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
                    maxLength={500}
                    disabled={isSubmitting}
                  />
                );
              }}
            />
          </div>

          {/* Tags (w-full) */}
          <div className="mt-4">
            <Controller
              control={form.control}
              name="tags"
              render={({ field }) => (
                <InputTags
                  label={t("form.generalInformation.tags")}
                  errorMessage={errorMessageAsLangKey(errors.tags?.message, t)}
                  maxLength={30}
                  disabled={isSubmitting}
                  isRequired
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    form.trigger("tags");
                  }}
                  onValidate={() => form.trigger("tags")}
                  placeholder={t("form.generalInformation.tagsPlaceholder")}
                />
              )}
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
          {isSubmitting ? t("form.actions.saving") : t("form.actions.save")}
        </Button>
      </footer>
    </form>
  );
};
