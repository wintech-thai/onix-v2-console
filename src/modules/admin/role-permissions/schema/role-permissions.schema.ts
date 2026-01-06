import { z } from "zod";

export const rolePermissionsSchema = z.object({
  roleName: z.string().min(1, "form.validation.roleNameRequired"),
  roleDescription: z.string().min(1, "form.validation.roleDescriptionRequired"),
  tags: z.string().min(1, "form.validation.tagsRequired"),
  permissions: z.array(
    z.object({
      controllerName: z.string(),
      apiPermissions: z.array(
        z.object({
          controllerName: z.string(),
          apiName: z.string(),
          isAllowed: z.boolean(),
        })
      ),
    })
  ),
});

export type RolePermissionsSchemaType = z.infer<typeof rolePermissionsSchema>;
