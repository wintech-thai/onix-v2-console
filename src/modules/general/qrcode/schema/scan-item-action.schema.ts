import { TFunction } from "i18next";
import z from "zod";

export const useScanItemActionSchema = (t: TFunction<"common", undefined>) => {
  return z.object({
    redirectUrl: z
      .string()
      .min(1, t("qrcode.scanItemAction.validation.redirectUrlRequired"))
      .max(80, t("qrcode.scanItemAction.validation.redirectUrlMax"))
      .url(t("qrcode.scanItemAction.validation.invalidUrl")),
    encryptionKey: z
      .string()
      .min(16, t("qrcode.scanItemAction.validation.encryptionKeyLength"))
      .max(16, t("qrcode.scanItemAction.validation.encryptionKeyLength")),
    encryptionIV: z
      .string()
      .min(16, t("qrcode.scanItemAction.validation.encryptionIVLength"))
      .max(16, t("qrcode.scanItemAction.validation.encryptionIVLength")),
    themeVerify: z
      .string()
      .max(15, t("qrcode.scanItemAction.validation.themeVerifyMax"))
      .optional(),
    registeredAwareFlag: z.string().min(1, t("qrcode.scanItemAction.validation.registeredAwareFlagRequired")),
    createdDate: z.string().min(1, t("qrcode.scanItemAction.validation.createdDateRequired"))
  });
};

export type ScanItemActionSchemaType = z.infer<
  ReturnType<typeof useScanItemActionSchema>
>;
