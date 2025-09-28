import { z } from "zod";

export const loginSchema = z.object({
  UserName: z.string().min(1, "Username is required"),
  Password: z.string().min(1, "Password is required"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
