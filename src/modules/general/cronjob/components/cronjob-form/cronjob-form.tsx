import { ArrowLeftIcon, XIcon } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { CronJobScehmaType, cronJobSchema } from "../../schema/cronjob.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, KeyboardEvent } from "react";
import { errorMessageAsLangKey } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CronJobFormProps {
  onSubmit: (data: CronJobScehmaType) => Promise<void>;
  initialValue: CronJobScehmaType;
  isUpdate: boolean;
  onBack?: () => void;
}

export const CronJobForm = ({
  initialValue,
  isUpdate,
  onSubmit,
  onBack,
}: CronJobFormProps) => {
  const { t } = useTranslation("cronjob");
  const form = useForm<CronJobScehmaType>({
    resolver: zodResolver(cronJobSchema),
    defaultValues: initialValue || {
      description: "",
      name: "",
      parameters: [],
      tags: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const { tags } = form.watch();
  const [tagInput, setTagInput] = useState("");

  // Use field array for parameters
  const { fields: parameterFields } = useFieldArray({
    control: form.control,
    name: "parameters",
  });

  // Handle tags
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

  const handleFormSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form className="h-full flex flex-col" onSubmit={handleFormSubmit}>
      <header className="p-4 border-b">
        <h1 className="text-lg font-bold">
          <ArrowLeftIcon
            className="inline cursor-pointer hover:text-primary"
            onClick={onBack}
          />{" "}
          {isUpdate ? t("form.updateTitle") : t("form.createTitle")}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Part 1: Detail Section */}
        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">{t("form.detail.title")}</header>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.detail.name")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      fieldState.error?.message,
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
              render={({ field, fieldState }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.detail.description")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      fieldState.error?.message,
                      t
                    )}
                    maxLength={200}
                    disabled={isSubmitting}
                  />
                );
              }}
            />
          </div>

          <div className="mt-4">
            <Label>
              {t("form.detail.tags")} <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("form.tagsPlaceholder")}
                errorMessage={errorMessageAsLangKey(
                  form.formState.errors.tags?.message,
                  t
                )}
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
                      disabled={isSubmitting}
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Part 2: Parameters Section */}
        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">
            {t("form.parameters.title")}
          </header>

          <div className="mt-4 space-y-3">
            {parameterFields && parameterFields.length > 0 ? (
              parameterFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid md:grid-cols-2 gap-2 items-start"
                >
                  <Controller
                    control={form.control}
                    name={`parameters.${index}.name`}
                    render={({ field, fieldState }) => {
                      return (
                        <Input
                          {...field}
                          readOnly
                          label={index === 0 ? t("form.parameters.name") : undefined}
                          placeholder={t("form.parameters.name")}
                          errorMessage={errorMessageAsLangKey(
                            fieldState.error?.message,
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
                    name={`parameters.${index}.value`}
                    render={({ field, fieldState }) => {
                      return (
                        <Input
                          {...field}
                          label={index === 0 ? t("form.parameters.value") : undefined}
                          placeholder={t("form.parameters.value")}
                          errorMessage={errorMessageAsLangKey(
                            fieldState.error?.message,
                            t
                          )}
                          maxLength={100}
                          disabled={isSubmitting}
                        />
                      );
                    }}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("form.parameters.noParameters")}
              </p>
            )}
          </div>
        </div>
      </div>

      <footer className="p-4 border-t flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </footer>
    </form>
  );
};


