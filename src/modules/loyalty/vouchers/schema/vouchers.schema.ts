import z from "zod";

export const voucherSchema = z.object({
  customerId: z.string().min(1, { message: "form.validation.required" }),
  customerCode: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  privilegeId: z.string().min(1, { message: "form.validation.required" }),
  privilegeCode: z.string().optional().nullable(),
  privilegeName: z.string().optional().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  voucherParams: z.string().nullable(),
  redeemPrice: z.number().nullable(),
});

export type VoucherSchemaType = z.infer<typeof voucherSchema>;
