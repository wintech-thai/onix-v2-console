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

  const form = useForm<ProductSchemaType>({
    resolver: zodResolver(useProductSchema(t)),
    defaultValues: defaultValues,
  });

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
  };

  return (
    <FormProvider {...form}>
      <div className="h-full flex flex-col">
        <form
          className="h-full flex flex-col"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <header className="p-4 border border-b">
            <h1 className="text-lg font-bold">
              <ArrowLeftIcon
                onClick={() => router.back()}
                className="inline cursor-pointer"
              />{" "}
              {isUpdate ? t("product.updateTitle") : t("product.createTitle")}
            </h1>
          </header>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <ProductDetailForm />

            <ProductNarrativesForm />

            <ProductPropertiesForm />

            <ProductContentForm />
          </div>

          <div className="border-t py-2 px-4 shrink-0 flex items-center justify-end gap-x-2">
            <Button onClick={() => router.back()} disabled={isSubmitting} variant="destructive" type="button">
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
