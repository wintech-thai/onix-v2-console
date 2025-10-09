import { TFunction } from "i18next";
import z from "zod";

export const useScanItemThemplateSchema = (t: TFunction<"common", undefined>) => {
  return z.object({
    serialPrefixDigit: z.number({
    })
      .min(2, t("qrcode.scanItemTemplate.validation.serialPrefixDigitMin"))
      .max(3, t("qrcode.scanItemTemplate.validation.serialPrefixDigitMax")),
    generatorCount: z.number({
      message: t("qrcode.scanItemTemplate.validation.generatorCountRequired"),
    })
      .min(1, t("qrcode.scanItemTemplate.validation.generatorCountRequired")),
    serialDigit: z.number({
      message: "qrcode.scanItemTemplate.validation.serialDigitRequired",
    })
      .min(7, t("qrcode.scanItemTemplate.validation.serialDigitMin"))
      .max(9, t("qrcode.scanItemTemplate.validation.serialDigitMax")),
    pinDigit: z.number({
    })
      .min(7, t("qrcode.scanItemTemplate.validation.pinDigitMin"))
      .max(9, t("qrcode.scanItemTemplate.validation.pinDigitMax")),
    urlTemplate: z.string().min(1, t("qrcode.scanItemTemplate.validation.urlTemplateRequired")),
    notificationEmail: z.string().email(t("qrcode.scanItemTemplate.validation.invalidEmail")),
    createdDate: z.string().min(1, t("qrcode.scanItemTemplate.validation.createdDateRequired"))
  });
}

export type ScanItemTemplateSchemaType = z.infer<
  ReturnType<typeof useScanItemThemplateSchema>
>;

