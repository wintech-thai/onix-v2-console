import { tk } from "@/types/deep-key-of";
import z from "zod";

export const resetPasswordSchema = z.object({
  currentPassword: z.string().min(1, tk("auth.currentPasswordRequired") ),
  newPassword: z.string().min(1, tk("auth.newPasswordRequired")),
  confirmNewPassword: z.string().min(1, tk("auth.confirmNewPasswordRequired")),
}).superRefine((data, ctx) => {
  if (data.newPassword !== data.confirmNewPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: tk("auth.passwordMismatch"),
      path: ["confirmNewPassword"],
    });
  }
})
