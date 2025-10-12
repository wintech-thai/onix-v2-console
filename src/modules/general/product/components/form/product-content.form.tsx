import { CKEditorComponent } from "@/components/ui/ckeditor";
import { Controller, useFormContext } from "react-hook-form";
import { ProductSchemaType } from "../../schema/product.schema";

export const ProductContentForm = () => {
  const form = useFormContext<ProductSchemaType>();

  return (
    <div className="p-4 md:p-6 border rounded-lg">
      <header className="text-lg font-bold mb-4">Content</header>
      <Controller
        control={form.control}
        name="content"
        render={({ field, fieldState }) => (
          <div>
            <CKEditorComponent value={field.value} onChange={field.onChange} />
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
