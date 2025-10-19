import { useTranslation } from "react-i18next";
import z from "zod";

export const useScanItemThemplateSchema = () => {
  const { t } = useTranslation("scan-item")
  return z.object({
    serialPrefixDigit: z.number({
    })
      .min(2, t("scanItemTemplate.validation.serialPrefixDigitMin"))
      .max(3, t("scanItemTemplate.validation.serialPrefixDigitMax")),
    generatorCount: z.number({
      message: t("scanItemTemplate.validation.generatorCountRequired"),
    })
      .min(1, t("scanItemTemplate.validation.generatorCountRequired")),
    serialDigit: z.number({
      message: "scanItemTemplate.validation.serialDigitRequired",
    })
      .min(7, t("scanItemTemplate.validation.serialDigitMin"))
      .max(9, t("scanItemTemplate.validation.serialDigitMax")),
    pinDigit: z.number({
    })
      .min(7, t("scanItemTemplate.validation.pinDigitMin"))
      .max(9, t("scanItemTemplate.validation.pinDigitMax")),
    urlTemplate: z.string().min(1, t("scanItemTemplate.validation.urlTemplateRequired")),
    notificationEmail: z.string().email(t("scanItemTemplate.validation.invalidEmail")),
    createdDate: z.string().min(1, t("scanItemTemplate.validation.createdDateRequired"))
  });
}

export type ScanItemTemplateSchemaType = z.infer<
  ReturnType<typeof useScanItemThemplateSchema>
>;
