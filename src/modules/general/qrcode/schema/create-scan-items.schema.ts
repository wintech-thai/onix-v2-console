import z from "zod";

export const createScanItemsSchema = z.object({
  serial: z.string().min(1, "scan-item:create.validation.serialRequired"),
  pin: z.string().min(1, "scan-item:create.validation.pinRequired"),
})
