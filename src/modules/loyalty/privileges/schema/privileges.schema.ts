import z from "zod";

export const privilegesSchema = z.object({
  code: z.string().min(1, "form.validation.codeRequired"),
  description: z.string().min(1, "form.validation.descriptionRequired"),
  tags: z.string().min(1, "form.validation.tagsRequired"),
  status: z.string().min(1, "form.validation.statusRequired"),
  effectiveDate: z.string().nullable(),
  expireDate: z.string().nullable(),
  content: z.string().min(1, "form.validation.contentRequired"),
});

export type PrivilegesSchemaType = z.infer<typeof privilegesSchema>;
