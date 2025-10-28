import { z } from "zod";

export const customerSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  primaryEmail: z.email(),
  tags: z.string().min(1),
  content: z.string().nullable(),
});

export type CustomerSchemaType = z.infer<typeof customerSchema>;
