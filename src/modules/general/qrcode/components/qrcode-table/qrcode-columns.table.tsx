"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { fetchScanItemsApi, IScanItems } from "../../api/fetch-qrcodes.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckIcon, Loader, MoreHorizontalIcon } from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useConfirm as Confirm } from "@/hooks/use-confirm";
import { unVerifyScanItemsApi } from "../../api/unverify-scan-items";
import { useParams as Params } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ScanItemDetailModal } from "../modal/scan-item-detial.modal";

type qrcodeTableColumns = ColumnDef<IScanItems> & {
  accessorKey?: keyof IScanItems;
};

export const useQrcodeTableColumns = (): qrcodeTableColumns[] => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          // onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      accessorKey: "serial",
      header: t("qrcode.columns.serial"),
      cell: ({ row }) => {
        return (
          <ScanItemDetailModal
            orgId={row.original.orgId}
            scanItemId={row.original.id}
          >
            <div className="text-primary underline cursor-pointer">
              {row.getValue("serial")}
            </div>
          </ScanItemDetailModal>
        );
      },
    },
    {
      accessorKey: "pin",
      header: t("qrcode.columns.pin"),
    },
    {
      accessorKey: "registeredFlag",
      header: t("qrcode.columns.verified"),
      cell: ({ row }) => {
        const productCode =
          row.original.registeredFlag ?? ("" as string | null);
        return productCode === "TRUE" ? (
          <CheckIcon className="size-4 text-green-500" />
        ) : null;
      },
    },
    {
      header: t("qrcode.columns.verifiedDate"),
      cell: ({ row }) => {
        const registeredFlag = row.original.registeredDate ?? ("" as string);
        return registeredFlag
          ? dayjs(registeredFlag).format("DD MMM YYYY HH:mm [GMT] Z")
          : "-";
      },
    },
    {
      accessorKey: "productCode",
      header: t("qrcode.columns.productCode"),
    },
    {
      accessorKey: "url",
      header: t("qrcode.columns.url"),
    },
    {
      accessorKey: "scanCount",
      header: () => {
        return (
          <div className="text-center">{t("qrcode.columns.scanCount")}</div>
        );
      },
      cell: ({ row }) => {
        return <div className="text-center">{row.getValue("scanCount")}</div>;
      },
    },
    {
      header: t("qrcode.columns.action"),
      cell: ({ row }) => {
        const [UnVerifyConfirmDialog, unVerifyConfirm] = Confirm({
          title: t("qrcode.unverify.title"),
          message: t("qrcode.unverify.message"),
          variant: "destructive",
        });
        const params = Params<{ orgId: string }>();

        const unVerifyScanItemMutate =
          unVerifyScanItemsApi.useDeleteScanItemsMutation(params.orgId);

        const handleUnVerify = async (scanId: string) => {
          const ok = await unVerifyConfirm();

          if (!ok) return;
          try {
            await unVerifyScanItemMutate.mutateAsync(scanId, {
              onSuccess: () => {
                toast.success(t("qrcode.unverify.success"));
                queryClient.invalidateQueries({
                  queryKey: fetchScanItemsApi.fetchScanItemsKey,
                  refetchType: "active",
                });
              },
              onError: () => {
                toast.error(t("qrcode.unverify.error"));
              },
            });
          } catch (error) {
            toast.error(t("qrcode.unverify.error"));
          }
        };

        return (
          <>
            <UnVerifyConfirmDialog />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {unVerifyScanItemMutate.isPending ? (
                    <Loader className="animate-spin size-4" />
                  ) : (
                    <MoreHorizontalIcon className="size-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => handleUnVerify(row.original.id)}
                >
                  {t("qrcode.actions.unVerifyScanItem")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => console.log("bindToCustomer")}
                >
                  {t("qrcode.actions.bindToCustomer")}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => console.log("bindToProduct")}>
                  {t("qrcode.actions.bindToProduct")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
};
