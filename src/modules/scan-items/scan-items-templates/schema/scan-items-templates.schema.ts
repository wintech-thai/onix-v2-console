import z from "zod";

export const scanItemTemplateSchema = z.object({
  templateName: z.string().min(1),
  description: z.string().min(1),
  tags: z.string().min(1),
  urlTemplate: z.string().min(1),
  serialPrefixDigit: z.number().min(0),
  pinDigit: z.number().min(0),
  serialDigit: z.number().min(0),
  generatorCount: z.number().min(0),
  notificationEmail: z.email(),
});

export type ScanItemTemplateSchemaType = z.infer<typeof scanItemTemplateSchema>;
