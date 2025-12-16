"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IVoucher } from "../../api/fetch-vouchers.api";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, X } from "lucide-react";
import dayjs from "dayjs";
import { useState } from "react";
import { VoucherPreviewModal } from "../voucher-preview-modal/voucher-preview-modal";
import { useParams } from "next/navigation";
import { enabledVoucherApi } from "../../api/enabled-vouchers.api";
import { disabledVoucherApi } from "../../api/disabled-vouchers.api";
import { getVoucherVerifyQrUrl } from "../../api/get-voucher-verify-qr-url.api";
import { setVoucherUnusedByIdApi } from "../../api/set-voucher-unused-by-id.api";
import { getVoucherApi } from "../../api/get-voucher.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchVoucherApi } from "../../api/fetch-vouchers.api";
import { useConfirm } from "@/hooks/use-confirm";
import Link from "next/link";
import { RouteConfig } from "@/config/route.config";

export const useVoucherTableColumns = () => {
  const { t } = useTranslation(["voucher", "common"]);
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    voucher: IVoucher | null;
    qrUrl: string | null;
  }>({
    isOpen: false,
    voucher: null,
    qrUrl: null,
  });

  const [EnableConfirmDialog, confirmEnable] = useConfirm({
    title: t("enable.title"),
    message: t("enable.message"),
    variant: "default",
  });

  const [DisableConfirmDialog, confirmDisable] = useConfirm({
    title: t("disable.title"),
    message: t("disable.message"),
    variant: "destructive",
  });

  const [ReleaseConfirmDialog, confirmRelease] = useConfirm({
    title: t("release.title"),
    message: t("release.message"),
    variant: "default",
  });

  const columns: ColumnDef<IVoucher>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "voucherNo",
      header: t("columns.voucherNo"),
      cell: ({ row }) => (
        <Link
          className="text-primary hover:underline"
          href={RouteConfig.LOYALTY.VOUCHERS.UPDATE(
            row.original.orgId,
            row.original.id
          )}
        >
          {row.original.voucherNo}
        </Link>
      ),
    },
    {
      accessorKey: "privilegeCode",
      header: t("columns.privilegeCode"),
      cell: ({ row }) => (
        <div className="text-sm">{row.original.privilegeCode}</div>
      ),
    },
    {
      accessorKey: "tags",
      header: t("columns.tags"),
      cell: ({ row }) => {
        if (!row.original.tags) return "-";

        return (
          <div className="max-w-[300px] w-full flex flex-wrap gap-x-0.5 gap-y-0.5">
            {row.original.tags.split(",").map((badge, i) => {
              return (
                <div
                  key={i}
                  className="bg-primary text-white rounded-lg px-2 py-1 cursor-pointer"
                >
                  {badge.trim()}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "isUsed",
      header: t("columns.used"),
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.isUsed === "YES" ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      accessorKey: "customerEmail",
      header: t("columns.customerEmail"),
      cell: ({ row }) => (
        <div className="text-sm">{row.original.customerEmail || "-"}</div>
      ),
    },
    {
      accessorKey: "redeemPrice",
      header: t("columns.redeemPoint"),
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.redeemPrice !== null
            ? row.original.redeemPrice.toLocaleString()
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("columns.status"),
      cell: ({ row }) => {
        const status = row.original.status;
        const isActive = status === "Active";
        return (
          <div className="flex justify-center">
            {isActive ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: t("columns.startDate"),
      cell: ({ row }) => {
        const startDate = row.original.startDate;
        return (
          <div className="text-sm">
            {startDate ? dayjs(startDate).format("DD MMM YYYY") : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "endDate",
      header: t("columns.expireDate"),
      cell: ({ row }) => {
        const endDate = row.original.endDate;
        return (
          <div className="text-sm">
            {endDate ? dayjs(endDate).format("DD MMM YYYY") : "-"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <>
          {t("columns.actions")}
          <VoucherPreviewModal
            open={previewState.isOpen}
            voucher={previewState.voucher}
            qrUrl={previewState.qrUrl}
            onOpenChange={(open) =>
              setPreviewState({ isOpen: open, voucher: null, qrUrl: null })
            }
          />
          <EnableConfirmDialog />
          <DisableConfirmDialog />
          <ReleaseConfirmDialog />
        </>
      ),
      cell: ({ row }) => {
        const voucher = row.original;
        const isActive = voucher.status === "Active";

        const enableVoucher = enabledVoucherApi.useEnabledVoucher();
        const disableVoucher = disabledVoucherApi.useDisabledVoucher();

        const getQrUrl = getVoucherVerifyQrUrl.useGetVoucherVerifyQrUrl();
        const fetchVoucher = getVoucherApi.useVoucherMutate();

        const handlePreview = async () => {
          const toastId = toast.loading(t("common:common.loading"));

          try {
            // Fetch full voucher data including pin and privilegeName
            const voucherResponse = await fetchVoucher.mutateAsync({
              orgId: params.orgId,
              voucherId: voucher.id,
            });

            const fullVoucherData = voucherResponse.data.voucher;

            if (!fullVoucherData) {
              throw new Error("Failed to load voucher data");
            }

            // Fetch QR URL
            const qrResponse = await getQrUrl.mutateAsync({
              orgId: params.orgId,
              voucherId: voucher.id,
            });

            const qrUrl = qrResponse.data.voucher.voucherVerifyUrl;

            // Check if URL is too long for QR code
            if (qrUrl && typeof qrUrl === "string" && qrUrl.length > 1200) {
              toast.warning(
                `QR URL too long (${qrUrl.length} chars). URL will be displayed instead.`,
                { id: toastId }
              );
            } else {
              toast.dismiss(toastId);
            }

            setPreviewState({ isOpen: true, voucher: fullVoucherData, qrUrl: qrUrl || null });
          } catch (error) {
            toast.error(t("messages.loadQrError"), { id: toastId });
            // Still open modal but without QR URL
            setPreviewState({ isOpen: true, voucher, qrUrl: null });
            console.error("Failed to load voucher data:", error);
          }
        };

        const handleEnable = async () => {
          const confirmed = await confirmEnable();
          if (!confirmed) return;

          const toastId = toast.loading(t("enable.loading"));

          try {
            await enableVoucher.mutateAsync({
              orgId: params.orgId,
              voucherId: voucher.id,
            });

            toast.success(t("enable.success"), { id: toastId });

            queryClient.invalidateQueries({
              queryKey: [fetchVoucherApi.key],
              refetchType: "active",
            });
          } catch (error) {
            toast.error(t("enable.error"), { id: toastId });
            console.error("Failed to enable voucher:", error);
          }
        };

        const handleDisable = async () => {
          const confirmed = await confirmDisable();
          if (!confirmed) return;

          const toastId = toast.loading(t("disable.loading"));

          try {
            await disableVoucher.mutateAsync({
              orgId: params.orgId,
              voucherId: voucher.id,
            });

            toast.success(t("disable.success"), { id: toastId });

            queryClient.invalidateQueries({
              queryKey: [fetchVoucherApi.key],
              refetchType: "active",
            });
          } catch (error) {
            toast.error(t("disable.error"), { id: toastId });
            console.error("Failed to disable voucher:", error);
          }
        };

        const handleVerify = async () => {
          const toastId = toast.loading(t("verify.loading"));

          try {
            const response = await getQrUrl.mutateAsync({
              orgId: params.orgId,
              voucherId: voucher.id,
            });

            const verifyUrl = response.data.voucher.voucherVerifyUrl;

            if (verifyUrl && typeof verifyUrl === "string") {
              window.open(verifyUrl, "_blank");
              toast.success(t("verify.success"), { id: toastId });
            } else {
              toast.error(t("verify.error"), { id: toastId });
            }
          } catch (error) {
            toast.error(t("verify.error"), { id: toastId });
            console.error("Failed to get verify URL:", error);
          }
        };

        const releaseVoucher =
          setVoucherUnusedByIdApi.useSetVoucherUnusedById();

        const handleRelease = async () => {
          const confirmed = await confirmRelease();
          if (!confirmed) return;

          const toastId = toast.loading(t("release.loading"));

          try {
            await releaseVoucher.mutateAsync({
              orgId: params.orgId,
              voucherId: voucher.id,
            });

            toast.success(t("release.success"), { id: toastId });

            queryClient.invalidateQueries({
              queryKey: [fetchVoucherApi.key],
              refetchType: "active",
            });
          } catch (error) {
            toast.error(t("release.error"), { id: toastId });
            console.error("Failed to release voucher:", error);
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handlePreview}>
                {t("actions.preview")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleVerify}>
                {t("actions.verify")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleRelease}>
                {t("actions.release")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleEnable} disabled={isActive}>
                {t("actions.enable")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDisable} disabled={!isActive}>
                {t("actions.disable")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return columns;
};
