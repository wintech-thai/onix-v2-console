import z from "zod";

export const scanItemTemplateSchema = z.object({
  templateName: z.string().min(1, "form.validation.templateNameRequired"),
  description: z.string().min(1, "form.validation.descriptionRequired"),
  tags: z.string().min(1, "form.validation.tagsRequired"),
  urlTemplate: z.string().min(1, "form.validation.urlTemplateRequired"),
  serialPrefixDigit: z.number().min(1, "form.validation.serialPrefixDigitMin"),
  pinDigit: z.number().min(1, "form.validation.pinDigitMin"),
  serialDigit: z.number().min(1, "form.validation.serialDigitMin"),
  generatorCount: z.number().min(1, "form.validation.generatorCountMin"),
  notificationEmail: z.string().email("form.validation.notificationEmailInvalid"),
});

export type ScanItemTemplateSchemaType = z.infer<typeof scanItemTemplateSchema>;
