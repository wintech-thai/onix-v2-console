import z from "zod";

export const productImageSchema = z.object({
  image: z.string(),
  narative: z.string(),
  tags: z.string(),
  category: z.string(),
});

export type ProductImageSchemaType = z.infer<typeof productImageSchema>;
