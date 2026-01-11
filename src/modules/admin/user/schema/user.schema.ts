import z from "zod";

export const userSchema = z.object({
  userName: z.string().min(4, "form.validation.userNameRequired").max(20, "form.validation.userNameRequired"),
  tmpUserEmail: z.string().email("form.validation.emailInvalid"),
  // roles: z.array(z.string()).min(1, "form.validation.rolesRequired"),
  roles: z.array(z.string()),
  tags: z.string().min(1, "form.validation.tagsRequired"),
  customRoleId: z.string().nullable().optional(),
  customRoleName: z.string().nullable().optional(),
  customRoleDesc: z.string().nullable().optional(),
});

export type UserSchemaType = z.infer<typeof userSchema>;
