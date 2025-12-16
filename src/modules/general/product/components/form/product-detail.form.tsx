import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ProductSchemaType } from "../../schema/product.schema";
import { Input } from "@/components/ui/input";
import { InputTags } from "@/components/ui/input-tags";



import { errorMessageAsLangKey } from "@/lib/utils";

interface ProductDetailFormProps {
  isUpdate: boolean;
}
export const ProductDetailForm = ({
  isUpdate,
}: ProductDetailFormProps) => {
  const { t } = useTranslation("product");
  const form = useFormContext<ProductSchemaType>();
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="p-4 md:p-6 border rounded-lg">
      <header className="text-lg font-bold">{t("detail.title")}</header>
      <div className="grid md:grid-cols-2 gap-2 mt-4">
        <Controller
          control={form.control}
          name="code"
          render={({ field, fieldState }) => {
            return (
              <Input
                {...field}
                label={t("detail.code")}
                isRequired
                errorMessage={errorMessageAsLangKey(fieldState.error?.message, t)}
                maxLength={30}
                disabled={isUpdate || isSubmitting}
              />
            );
          }}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => {
            return (
              <Input
                {...field}
                label={t("detail.description")}
                isRequired
                errorMessage={errorMessageAsLangKey(fieldState.error?.message, t)}
                maxLength={150}
                disabled={isSubmitting}
              />
            );
          }}
        />
      </div>

      <div className="mt-4">
        <Controller
          control={form.control}
          name="tags"
          render={({ field }) => (
            <InputTags
              label={t("detail.tags")}
              placeholder="Type and press Enter to add tag"
              errorMessage={errorMessageAsLangKey(form.formState.errors.tags?.message, t)}
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
    </div>
  );
};
