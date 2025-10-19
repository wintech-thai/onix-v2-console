import { z } from "zod";

export const useProductSchema = () => {
  return z.object({
    id: z.string().nullable(),
    orgId: z.string().min(1, "validation.codeRequired"),
    code: z.string().min(1, "validation.codeRequired"),
    description: z.string().min(1, "validation.descriptionRequired"),
    tags: z.string().min(1, "validation.tagsRequired"),
    itemType: z.number(),
    narrative: z.string(),
    content: z.string(),
    properties: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
    narratives: z.array(z.object({
      text: z.string().min(1, "validation.narrativeRequired")
    })),
    images: z.array(
      z.object({
        id: z.string().nullable(),
        orgId: z.string(),
        itemId: z.string().nullable(),
        item: z.string().nullable(),
        imagePath: z.string(),
        imageUrl: z.string(),
        narative: z.string(),
        tags: z.string(),
        category: z.number(),
        sortingOrder: z.number(),
      })
    ),
  })
}

export type ProductSchemaType = z.infer<
  ReturnType<typeof useProductSchema>
>;
