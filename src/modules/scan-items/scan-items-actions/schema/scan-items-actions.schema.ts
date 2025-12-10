import z from "zod";

export const useScanItemsActionsSchema = () => {
  return z.object({
    actionName: z.string().min(1, "form.validation.actionNameRequired"),
    description: z.string().min(1, "form.validation.descriptionRequired"),
    redirectUrl: z.string().min(1, "form.validation.redirectUrlRequired"),
    encryptionKey: z
      .string()
      .min(16, "form.validation.encryptionKeyLength")
      .max(16, "form.validation.encryptionKeyLength"),
    encryptionIV: z
      .string()
      .min(16, "form.validation.encryptionIVLength")
      .max(16, "form.validation.encryptionIVLength"),
    themeVerify: z.string().min(1, "form.validation.themeVerifyRequired"),
    registeredAwareFlag: z.string().min(1, "form.validation.registeredAwareFlagRequired"),
    tags: z.string().min(1, "form.validation.tagsRequired"),
  });
};

export type ScanItemsActionsSchemaType = z.infer<
  ReturnType<typeof useScanItemsActionsSchema>
>;
