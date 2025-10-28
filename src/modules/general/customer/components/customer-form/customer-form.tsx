import { Button } from "@/components/ui/button";
import { CKEditorComponent } from "@/components/ui/ckeditor";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import {
  customerSchema,
  CustomerSchemaType,
} from "../../schema/customer.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardEvent, useState } from "react";

export const CustomerForm = () => {
  const router = useRouter();

  const form = useForm<CustomerSchemaType>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      code: "",
      content: "",
      name: "",
      primaryEmail: "",
      tags: "",
    },
  });
  const isSubmitting = form.formState.isSubmitting;
  const errors = form.formState.errors;
  const { tags } = form.watch();
  const [tagInput, setTagInput] = useState("");

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

  const handleCancel = () => {
    return router.back();
  };

  const handleSubmit = async (values: CustomerSchemaType) => {
    console.log("values", values);
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="h-full flex flex-col"
    >
      <header className="p-4 border border-b">
        <h1 className="text-lg font-bold">
          <ArrowLeftIcon
            onClick={handleCancel}
            className="inline cursor-pointer"
          />{" "}
          CustomerForm ยังไม่ต่อ API Mock Form
        </h1>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">Customer Information</header>
          <div className="grid md:grid-cols-2 mt-4 gap-4 mb-4">
            <Controller
              control={form.control}
              name="code"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label="Code"
                    isRequired
                    errorMessage={errors.code?.message}
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
                    label="Name"
                    isRequired
                    errorMessage={errors.name?.message}
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
                    label="Email"
                    isRequired
                    errorMessage={errors.primaryEmail?.message}
                  />
                );
              }}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
              disabled={isSubmitting}
              isRequired
              errorMessage={errors.tags?.message}
            />
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
                      className="hover:bg-primary-foreground/20 rounded-full p-0.5 disabled:cursor-not-allowed"
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

        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">Content</header>
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
                        {/* {errorMessageAsLangKey(fieldState.error.message, t)} */}
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
          Cancel
          {/* {t("form.actions.cancel")} */}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Save
          {/* {t("form.actions.save")} */}
        </Button>
      </footer>
    </form>
  );
};
