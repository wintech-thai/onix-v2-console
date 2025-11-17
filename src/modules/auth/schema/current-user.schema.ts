import z from "zod";

export const currentUserSchema = z.object({
  name: z.string().min(1, "validation.nameRequired"),
  lastName: z.string().min(1, "validation.lastNameRequired"),
  phoneNumber: z
    .string()
    .min(1, "validation.phoneNumberRequired")
    .regex(/^[1-9][0-9]{7,14}$/, "validation.phoneNumberFormat"),
  secondaryEmail: z
    .string()
    .email("validation.emailFormat")
    .optional()
    .or(z.literal("")),
});

export type CurrentUserSchemaType = z.infer<typeof currentUserSchema>;
