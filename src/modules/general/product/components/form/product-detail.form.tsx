import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ProductSchemaType } from "../../schema/product.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XIcon } from "lucide-react";
import { useState, KeyboardEvent } from "react";
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
  const { tags } = form.watch();
  const [tagInput, setTagInput] = useState("");

  const tagsArray = tags
    ? tags.split(",").filter((tag) => tag.trim() !== "")
    : [];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedTag = tagInput.trim();

      if (trimmedTag && !tagsArray.includes(trimmedTag)) {
        const newTags = [...tagsArray, trimmedTag];
        form.setValue("tags", newTags.join(","), {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.trigger("tags");
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tagsArray.filter((tag) => tag !== tagToRemove);
    form.setValue("tags", newTags.join(","), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

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
        <Label>
          {t("detail.tags")} <span className="text-red-500">*</span>
        </Label>
        <div className="mt-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type and press Enter to add tag"
            errorMessage={errorMessageAsLangKey(form.formState.errors.tags?.message, t)}
            maxLength={30}
            disabled={isSubmitting}
          />
        </div>
        {tagsArray.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tagsArray.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
