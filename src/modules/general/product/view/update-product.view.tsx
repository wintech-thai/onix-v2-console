"use client";

import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "../components/form/product-form";
import { ProductSchemaType } from "../schema/product.schema";
import { toast } from "sonner";
import { getProductApi } from "../api/get-product.api";
import { updateProductApi } from "../api/update-product.api";
import { useQueryClient } from "@tanstack/react-query";
import { fetchProductsApi } from "../api/fetch-products.api";
import { RouteConfig } from "@/config/route.config";
import { LoaderIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const UpdateProductView = () => {
  const { t } = useTranslation("product");
  const queryClient = useQueryClient();
  const router = useRouter();

  const params = useParams<{ orgId: string; productId: string }>();
  const updateProductMutate = updateProductApi.useMutation();

  const productQuery = getProductApi.useQuery({
    orgId: params.orgId,
    productId: params.productId,
  });

  if (productQuery.isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    )
  }

  const payload = productQuery.data?.data;

  const handleSubmit = async (value: ProductSchemaType) => {
    await updateProductMutate.mutateAsync(
      {
        value: {
          ...value,
          properties: "",
          images: payload?.images ?? [],
          orgId: params.orgId,
          narratives: value.narratives.map((n) => n.text),
          propertiesObj: value.properties,
        },
        orgId: params.orgId,
        productId: params.productId,
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status !== "OK") {
            return toast.error(data.description);
          }

          // Invalidate and refetch specific product query (must match the queryKey structure)
          queryClient.invalidateQueries({
            queryKey: [getProductApi.key, { orgId: params.orgId, productId: params.productId }],
            refetchType: "all",
          });

          // Invalidate ALL products list queries (including count)
          queryClient.invalidateQueries({
            queryKey: fetchProductsApi.fetchProductKey,
            refetchType: "all",
          });

          toast.success(t("product.messages.updateSuccess"));
          router.push(RouteConfig.GENERAL.PRODUCT.LIST(params.orgId));
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  if (!payload) {
    throw new Error("Product not found");
  }

  // Capitalize first letter of each property key and convert to Record type
  const capitalizedProperties = payload.propertiesObj
    ? Object.entries(payload.propertiesObj).reduce((acc, [key, value]) => {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        acc[capitalizedKey] = value as string | number;
        return acc;
      }, {} as Record<string, string | number>)
    : {};

  return (
    <ProductForm
      isUpdate
      onSubmit={handleSubmit}
      defaultValues={{
        id: payload.id,
        orgId: params.orgId,
        code: payload.code,
        description: payload.description,
        tags: payload.tags ?? "",
        itemType: payload.itemType,
        narrative: payload.narrative,
        content: payload.content,
        properties: capitalizedProperties,
        narratives: payload.narratives.map((n) => {
          return { text: n ?? "" };
        }),
        images: [],
      }}
    />
  );
};

export default UpdateProductView;
