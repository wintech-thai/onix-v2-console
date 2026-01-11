"use client";

import { useParams } from "next/navigation";
import { VoucherForm } from "../components/voucher-form/voucher-form";
import { getVoucherApi } from "../api/get-voucher.api";
import { Loader } from "lucide-react";
import { VoucherSchemaType } from "../schema/vouchers.schema";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

const UpdateVoucherViewPage = () => {
  const params = useParams<{ orgId: string; voucherId: string }>();

  const getVoucher = getVoucherApi.useGetVoucher(params);

  if (getVoucher.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (getVoucher.isError) {
    if (getVoucher.error.response?.status === 403) {
      return <NoPermissionsPage errors={getVoucher.error} />;
    }

    throw new Error(getVoucher.error.message);
  }

  const voucherPayload = getVoucher.data?.data.voucher;

  if (!voucherPayload) {
    throw new Error("Voucher Not Found");
  }

  const handleSubmit = async (values: VoucherSchemaType) => {
    // No update API, this is view-only mode
    console.log("View-only mode, no submission", values);
  };

  return (
    <VoucherForm
      initialValue={{
        customerId: voucherPayload.customerId || "",
        customerCode: voucherPayload.customerCode || "",
        customerName: voucherPayload.customerName || "",
        customerEmail: voucherPayload.customerEmail || "",
        privilegeId: voucherPayload.privilegeId || "",
        privilegeCode: voucherPayload.privilegeCode || "",
        privilegeName: voucherPayload.privilegeName || "",
        startDate: voucherPayload.startDate,
        endDate: voucherPayload.endDate,
        voucherParams: voucherPayload.voucherParams || "{}",
        redeemPrice: voucherPayload.redeemPrice,
      }}
      isUpdate={true}
      onSubmit={handleSubmit}
    />
  );
};

export default UpdateVoucherViewPage;
