import z from "zod";

export const scanItemTemplateSchema = z.object({
  templateName: z.string().min(1, "form.validation.templateNameRequired"),
  description: z.string().min(1, "form.validation.descriptionRequired"),
  tags: z.string().min(1, "form.validation.tagsRequired"),
  urlTemplate: z.string().min(1, "form.validation.urlTemplateRequired"),
  serialPrefixDigit: z.number().min(2, "form.validation.serialPrefixDigitRange").max(3, "form.validation.serialPrefixDigitRange"),
  pinDigit: z.number().min(5, "form.validation.pinDigitRange").max(7, "form.validation.pinDigitRange"),
  serialDigit: z.number().min(6, "form.validation.serialDigitRange").max(7, "form.validation.serialDigitRange"),
  generatorCount: z.number().min(1, "form.validation.generatorCountMin"),
  notificationEmail: z.string().email("form.validation.notificationEmailInvalid"),
});

export type ScanItemTemplateSchemaType = z.infer<typeof scanItemTemplateSchema>;
