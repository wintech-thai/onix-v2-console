import { Button } from "@/components/ui/button";
import { CKEditorComponent } from "@/components/ui/ckeditor";
import { Input } from "@/components/ui/input";
import { InputTags } from "@/components/ui/input-tags";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import {
    customerSchema,
    CustomerSchemaType,
} from "../../schema/customer.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFormNavigationBlocker } from "@/hooks/use-form-navigation-blocker";
import { useConfirm } from "@/hooks/use-confirm";
import { useTranslation } from "react-i18next";
import { errorMessageAsLangKey } from "@/lib/utils";

interface CustomerFormProps {
  onSubmit: (values: CustomerSchemaType) => Promise<void>;
  initialValue: CustomerSchemaType;
  isUpdate: boolean;
}

export const CustomerForm = ({
  onSubmit,
  initialValue,
  isUpdate,
}: CustomerFormProps) => {
  const router = useRouter();
  const { t } = useTranslation("customer");
  const { setFormDirty } = useFormNavigationBlocker();

  const form = useForm<CustomerSchemaType>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialValue,
  });

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

  const handleSubmit = async (values: CustomerSchemaType) => {
    if (!isDirty) {
      return router.back();
    }

    await onSubmit(values);

    setFormDirty(false);
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
          <header className="text-lg font-bold">{t("form.customerInformation")}</header>
          <div className="grid md:grid-cols-2 mt-4 gap-4 mb-4">
            <Controller
              control={form.control}
              name="code"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.code")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(errors.code?.message, t)}
                    disabled={isSubmitting || isUpdate}
                    maxLength={20}
                  />
                );
              }}
            />
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.name")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(errors.name?.message, t)}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                );
              }}
            />
            <Controller
              control={form.control}
              name="primaryEmail"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.email")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(errors.primaryEmail?.message, t)}
                    disabled={isSubmitting || isUpdate}
                    maxLength={80}
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
                label={t("form.tags")}
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
              />
            )}
          />
        </div>

        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">{t("form.content")}</header>
          <div className="mt-4">
            <Controller
              control={form.control}
              name="content"
              render={({ field }) => {
                return (
                  <div>
                    <CKEditorComponent
                      disabled={isSubmitting}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                    {errors.content?.message && (
                      <p className="text-sm text-red-500 mt-2">
                        {errors.content.message}
                      </p>
                    )}
                  </div>
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
          {t("form.cancel")}
        </Button>
        <Button type="submit" isPending={isSubmitting} disabled={isSubmitting}>
          {t("form.save")}
        </Button>
      </footer>
    </form>
  );
};
