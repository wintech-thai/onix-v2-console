import { z } from "zod";

export const walletsSchema = z.object({
  name: z.string().min(1, "form.validation.name"),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export type WalletsSchemaType = z.infer<typeof walletsSchema>;
