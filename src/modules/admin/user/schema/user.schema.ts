import z from "zod";

export const userSchema = z.object({
  userName: z.string().min(4, "form.validation.userNameRequired").max(20, "form.validation.userNameRequired"),
  tmpUserEmail: z.string().email("form.validation.emailInvalid"),
  roles: z.array(z.string()).min(1, "form.validation.rolesRequired"),
});

export type UserSchemaType = z.infer<typeof userSchema>;
