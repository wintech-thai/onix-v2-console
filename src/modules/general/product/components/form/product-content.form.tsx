import { CKEditorComponent } from "@/components/ui/ckeditor";
import { Controller, useFormContext } from "react-hook-form";
import { ProductSchemaType } from "../../schema/product.schema";
import { useTranslation } from "react-i18next";

export const ProductContentForm = () => {
  const { t } = useTranslation("product");
  const form = useFormContext<ProductSchemaType>();
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="p-4 md:p-6 border rounded-lg">
      <header className="text-lg font-bold mb-4">
        {t("product.content.title")}
      </header>
      <Controller
        control={form.control}
        name="content"
        render={({ field, fieldState }) => (
          <div>
            <CKEditorComponent disabled={isSubmitting} value={field.value} onChange={field.onChange} />
            {fieldState.error && (
              <p className="text-sm text-red-500 mt-2">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
};
