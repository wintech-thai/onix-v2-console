import { z } from "zod";

export const pointsSchema = z.object({
  amount: z.number({
    error: "points.errors.amountRequired"
  }).min(1, "points.errors.amountRequired"),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export type PointsSchemaType = z.infer<typeof pointsSchema>;
