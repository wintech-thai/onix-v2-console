"use client";

import { ArrowLeftIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useProductSchema, ProductSchemaType } from "../../schema/product.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ProductPropertiesForm } from "./product-properties.form";
import { ProductDetailForm } from "./product-detail.form";
import { ProductNarrativesForm } from "./product-narratives.form";
import { ProductContentForm } from "./product-content.form";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import { useFormNavigationBlocker } from "@/hooks/use-form-navigation-blocker";
import { useEffect } from "react";

interface ProductFormProps {
  onSubmit: (data: ProductSchemaType) => Promise<void>;
  defaultValues?: Partial<ProductSchemaType>;
  isUpdate?: boolean;
}
export const ProductForm = ({
  onSubmit,
  defaultValues,
  isUpdate,
}: ProductFormProps) => {
  const { t } = useTranslation("product");
  const router = useRouter();
  const { setFormDirty } = useFormNavigationBlocker();

  const form = useForm<ProductSchemaType>({
    resolver: zodResolver(useProductSchema(t)),
    defaultValues: defaultValues,
  });

  const [ConfirmBack, confirmBack] = useConfirm({
    message: t("product.form.unsavedChanges"),
    title: t("product.form.leavePage"),
    variant: "destructive"
  });

  const isDirty = form.formState.isDirty;

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
  }

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: ProductSchemaType) => {
    await onSubmit({
      ...data,
      properties: Object.fromEntries(
        Object.entries(data.properties || {}).map(([key, value]) => [
          key.charAt(0).toLowerCase() + key.slice(1),
          value,
        ])
      ),
    });
    // Clear dirty state after successful submit
    setFormDirty(false);
  };

  return (
    <FormProvider {...form}>
      <div className="h-full flex flex-col">

        <ConfirmBack />

        <form
          className="h-full flex flex-col"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <header className="p-4 border border-b">
            <h1 className="text-lg font-bold">
              <ArrowLeftIcon
                onClick={handleCancel}
                className="inline cursor-pointer"
              />{" "}
              {isUpdate ? t("product.updateTitle") : t("product.createTitle")}
            </h1>
          </header>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <ProductDetailForm isUpdate={isUpdate ?? false} />

            <ProductNarrativesForm />

            <ProductPropertiesForm />

            <ProductContentForm />
          </div>

          <div className="border-t py-2 px-4 shrink-0 flex items-center justify-end gap-x-2">
            <Button onClick={handleCancel} disabled={isSubmitting} variant="destructive" type="button">
              {t("product.actions.cancel")}
            </Button>
            <Button isPending={isSubmitting}>
              {t("product.actions.save")}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};
