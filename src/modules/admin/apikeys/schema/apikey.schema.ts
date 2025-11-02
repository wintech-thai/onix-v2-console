import { z } from "zod";

export const apiKeySchema = z.object({
  keyName: z.string().min(1, "form.validation.keyNameRequired").max(100, "form.validation.keyNameTooLong"),
  keyDescription: z.string().min(1, "form.validation.keyDescriptionRequired").max(500, "form.validation.keyDescriptionTooLong"),
  roles: z.array(z.string()).min(1, "form.validation.rolesRequired"),
});

export type ApiKeySchemaType = z.infer<typeof apiKeySchema>;
