import z from "zod";

export const pointRulesSchema = z.object({
  ruleName: z.string().min(1, "Rule Name is required"),
  ruleDefinition: z.string().min(1, "Rule Definition is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.string().min(1, "Tags is required"),
  triggeredEvent: z.string().min(1, "Triggered Event is required"),
  priority: z.number("Priority is required").min(1, "Priority is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
});

export type PointRulesSchemaType = z.infer<typeof pointRulesSchema>;
