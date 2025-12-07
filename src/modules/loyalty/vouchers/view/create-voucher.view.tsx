"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createVoucherApi } from "../api/create-voucher.api";
import { VoucherForm } from "../components/voucher-form/voucher-form";
import { VoucherSchemaType } from "../schema/vouchers.schema";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { fetchVoucherApi } from "../api/fetch-vouchers.api";

const CreateVoucherViewPage = () => {
  const { t } = useTranslation("voucher");
  const params = useParams<{ orgId: string }>();
  const searchParams = useSearchParams();
  const privilegeId = searchParams.get("privilegeId");
  const router = useRouter();
  const queryClient = useQueryClient();
  const createVoucherMutation = createVoucherApi.useCreateVoucher();

  const onSubmit = async (values: VoucherSchemaType) => {
    await createVoucherMutation.mutateAsync(
      {
        orgId: params.orgId,
        values,
      },
      {
        onSuccess: async ({ data }) => {
          if (data.status === "OK") {
            await queryClient.invalidateQueries({
              queryKey: [fetchVoucherApi.key],
              refetchType: "active",
            });

            toast.success(t("messages.createSuccess"));
            return router.back();
          }

          return toast.error(data.description || t("messages.createError"));
        },
      }
    );
  };

  return (
    <VoucherForm
      initialValue={{
        customerId: "",
        customerCode: "",
        customerName: "",
        customerEmail: "",
        privilegeId: "",
        privilegeCode: "",
        privilegeName: "",
        startDate: null,
        endDate: null,
        voucherParams: "{}",
        redeemPrice: 0,
      }}
      isUpdate={false}
      onSubmit={onSubmit}
    />
  );
};

export default CreateVoucherViewPage;
