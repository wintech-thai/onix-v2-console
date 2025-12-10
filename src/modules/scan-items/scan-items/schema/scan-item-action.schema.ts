import { useTranslation } from "react-i18next";
import z from "zod";

export const useScanItemActionSchema = () => {
  const { t } = useTranslation("scan-item")
  return z.object({
    redirectUrl: z
      .string()
      .min(1, t("scanItemAction.validation.redirectUrlRequired"))
      .max(80, t("scanItemAction.validation.redirectUrlMax"))
      .url(t("scanItemAction.validation.invalidUrl")),
    encryptionKey: z
      .string()
      .min(16, t("scanItemAction.validation.encryptionKeyLength"))
      .max(16, t("scanItemAction.validation.encryptionKeyLength")),
    encryptionIV: z
      .string()
      .min(16, t("scanItemAction.validation.encryptionIVLength"))
      .max(16, t("scanItemAction.validation.encryptionIVLength")),
    themeVerify: z
      .string()
      .max(15, t("scanItemAction.validation.themeVerifyMax"))
      .optional(),
    registeredAwareFlag: z.string().min(1, t("scanItemAction.validation.registeredAwareFlagRequired")),
    createdDate: z.string().min(1, t("scanItemAction.validation.createdDateRequired"))
  });
};

export type ScanItemActionSchemaType = z.infer<
  ReturnType<typeof useScanItemActionSchema>
>;
