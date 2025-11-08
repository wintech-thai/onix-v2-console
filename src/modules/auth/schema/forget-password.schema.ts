import z from "zod";

export const resetPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "auth:currentPasswordRequired"),
    newPassword: z.string().min(1, "auth:newPasswordRequired"),
    confirmNewPassword: z.string().min(1, "auth:confirmNewPasswordRequired"),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "auth:passwordMismatch",
        path: ["confirmNewPassword"],
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("auth:error.invalidEmail").min(1, "auth:error.emailRequired"),
});
