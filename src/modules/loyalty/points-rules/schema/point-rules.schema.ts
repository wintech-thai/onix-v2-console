import z from "zod";

export const pointRulesSchema = z.object({
  ruleName: z.string().min(1),
  ruleDefinition: z.string().min(1),
  description: z.string().min(1),
  tags: z.string().min(1),
  triggeredEvent: z.string().min(1),
  priority: z.number(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export type PointRulesSchemaType = z.infer<typeof pointRulesSchema>;
