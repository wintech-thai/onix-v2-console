import { z } from "zod";

export const customerSchema = z.object({
  code: z.string().min(1, "form.validation.codeRequired"),
  name: z.string().min(1, "form.validation.nameRequired"),
  primaryEmail: z.email("form.validation.emailInvalid"),
  tags: z.string().min(1, "form.validation.tagsRequired"),
  content: z.string().nullable(),
});

export type CustomerSchemaType = z.infer<typeof customerSchema>;
