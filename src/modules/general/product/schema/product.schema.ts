import { z } from "zod";

export const productSchema = z.object({
  id: z.string().nullable(),
  orgId: z.string().min(1, "Organization ID is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.string().min(1, "At least one tag is required"),
  itemType: z.number(),
  narrative: z.string(),
  content: z.string().min(1, "Content is required"),
  properties: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
  narratives: z.array(z.object({
    text: z.string().min(1, "Narrative text is required")
  })).min(1, "At least one narrative is required"),
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
});

export type ProductSchemaType = z.infer<typeof productSchema>;
