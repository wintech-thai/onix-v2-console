import z from "zod";

export const scanItemActionSchema = z.object({
  orgId: z.string().min(1, "qrcode.scanItemAction.validation.orgIdRequired"),
  redirectUrl: z.string().url("qrcode.scanItemAction.validation.invalidUrl").optional(),
  encryptionKey: z.string().min(1, "qrcode.scanItemAction.validation.encryptionKeyRequired"),
  encryptionIV: z.string().min(1, "qrcode.scanItemAction.validation.encryptionIVRequired"),
  themeVerify: z.string().optional(),
  registeredAwareFlag: z.string().min(1, "qrcode.scanItemAction.validation.registeredAwareFlagRequired"),
  createdDate: z.string().min(1, "qrcode.scanItemAction.validation.createdDateRequired")
});
