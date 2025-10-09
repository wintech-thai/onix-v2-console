import z from "zod";

export const scanItemThemplateSchema = z.object({
  serialPrefixDigit: z.number({
    message: "qrcode.scanItemTemplate.validation.serialPrefixDigitRequired",
  })
    .min(2, "qrcode.scanItemTemplate.validation.serialPrefixDigitMin")
    .max(3, "qrcode.scanItemTemplate.validation.serialPrefixDigitMax"),
  generatorCount: z.number({
    message: "qrcode.scanItemTemplate.validation.generatorCountRequired",
  })
    .min(1, "qrcode.scanItemTemplate.validation.generatorCountRequired"),
  serialDigit: z.number({
    message: "qrcode.scanItemTemplate.validation.serialDigitRequired",
  })
    .min(7, "qrcode.scanItemTemplate.validation.serialDigitMin")
    .max(9, "qrcode.scanItemTemplate.validation.serialDigitMax"),
  pinDigit: z.number({
    message: "qrcode.scanItemTemplate.validation.pinDigitRequired",
  })
    .min(7, "qrcode.scanItemTemplate.validation.pinDigitMin")
    .max(9, "qrcode.scanItemTemplate.validation.pinDigitMax"),
  urlTemplate: z.string().min(1, "qrcode.scanItemTemplate.validation.urlTemplateRequired"),
  notificationEmail: z.string().email("qrcode.scanItemTemplate.validation.invalidEmail"),
  createdDate: z.string().min(1, "qrcode.scanItemTemplate.validation.createdDateRequired")
});
