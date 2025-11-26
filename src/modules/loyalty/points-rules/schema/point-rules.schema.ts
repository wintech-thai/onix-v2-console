import z from "zod";

export const pointRulesSchema = z.object({
  ruleName: z.string().min(1, "form.validation.ruleName"),
  ruleDefinition: z.string().min(1, "form.validation.ruleDefinition"),
  description: z.string().min(1, "form.validation.description"),
  tags: z.string().min(1, "form.validation.tags"),
  triggeredEvent: z.string().min(1, "form.validation.triggeredEvent"),
  priority: z.number("form.validation.priority").min(1, "form.validation.priority"),
  startDate: z.string(),
  endDate: z.string(),
});

export type PointRulesSchemaType = z.infer<typeof pointRulesSchema>;
