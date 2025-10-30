"use client";

import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "../components/form/product-form";
import { ProductSchemaType } from "../schema/product.schema";
import { createProductApi } from "../api/create-product.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchProductsApi } from "../api/fetch-products.api";
import { RouteConfig } from "@/config/route.config";
import { useTranslation } from "react-i18next";

const CreateProductView = () => {
  const { t } = useTranslation("product");
  const queryClient = useQueryClient();
  const params = useParams<{ orgId: string }>();
  const router = useRouter();

  const createProductMutate = createProductApi.useMutation();

  const handleSubmit = async (value: ProductSchemaType) => {
    await createProductMutate.mutateAsync(
      {
        params: {
          ...value,
          properties: "",
          images: [],
          orgId: params.orgId,
          narratives: value.narratives.map((n) => n.text),
          propertiesObj: value.properties,
        },
      },
      {
        onSuccess: ({ data }) => {
          if (data.status !== "OK") {
            return toast.error(data.description);
          }

          queryClient.invalidateQueries({
            queryKey: fetchProductsApi.fetchProductKey,
            refetchType: "inactive",
          });

          toast.success(t("messages.createSuccess"));
          return router.push(RouteConfig.GENERAL.PRODUCT.LIST(params.orgId));
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      defaultValues={{
        id: null,
        orgId: params.orgId,
        code: "",
        description: "",
        tags: "",
        itemType: 1,
        narrative: "",
        content: "",
        properties: {},
        narratives: [
          {
            text: "",
          },
        ],
        images: [],
      }}
    />
  );
};

export default CreateProductView;
