import z from "zod";

export const scanItemsFolderSchema = z.object({
  folderName: z.string().min(1),
  description: z.string().min(1),
  tags: z.string().min(1),
});

export type ScanItemsFolderSchemaType = z.infer<typeof scanItemsFolderSchema>;
