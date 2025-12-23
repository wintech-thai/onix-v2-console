import z from "zod";

export const scanItemsFolderSchema = z.object({
  folderName: z.string().min(1, "form.validate.folderNameRequired"),
  description: z.string().min(1, "form.validate.descriptionRequired"),
  tags: z.string().min(1, "form.validate.tagsRequired"),
});

export type ScanItemsFolderSchemaType = z.infer<typeof scanItemsFolderSchema>;
