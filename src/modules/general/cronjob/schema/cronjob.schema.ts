import z from "zod";

export const cronJobSchema = z.object({
  name: z.string().min(1, "form.validation.nameRequired"),
  description: z.string().min(1, "form.validation.descriptionRequired"),
  tags: z.string().min(1, "form.validation.tagsRequired"),
  parameters: z.array(z.object({
    name: z.string().min(1, "form.validation.parameterNameRequired"),
    value: z.string().min(1, "form.validation.parameterValueRequired")
  }))
})

export type CronJobScehmaType = z.infer<typeof cronJobSchema>;
