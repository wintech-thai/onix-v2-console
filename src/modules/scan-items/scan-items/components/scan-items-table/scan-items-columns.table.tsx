"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { fetchScanItemsApi, IScanItems } from "../../api/fetch-qrcodes.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckIcon, Loader, MoreHorizontalIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useConfirm as Confirm } from "@/hooks/use-confirm";
import { unVerifyScanItemsApi } from "../../api/unverify-scan-items";
import { useParams as Params, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { RouteConfig } from "@/config/route.config";
import { getScanItemUrlDryRunApi } from "../../api/get-scan-item-url-dry-run.api";
import { QrCodeModal } from "../modal/qrcode-modal";
import { useState as State } from "react";
import { detachScanItemToCustomerApi } from "@/modules/general/customer/api/detach-scan-item-from-customer.api";
import { detachScanItemFromProductApi } from "../../api/detach-scan-item-from-product.api";
import Link from "next/link";

type qrcodeTableColumns = ColumnDef<IScanItems> & {
  accessorKey?: keyof IScanItems;
};

export const useQrcodeTableColumns = (): qrcodeTableColumns[] => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation("scan-item");

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
      header: t("columns.serial"),
      cell: ({ row }) => {
        return (
            <Link href={RouteConfig.SCAN_ITEMS.ITEM.VIEW(
              row.original.orgId,
              row.original.id
            )} className="text-primary hover:underline cursor-pointer">
              {row.getValue("serial")}
            </Link>
        );
        // return (
        //   <ScanItemDetailModal
        //     orgId={row.original.orgId}
        //     scanItemId={row.original.id}
        //   >
        //     <div className="text-primary hover:underline cursor-pointer">
        //       {row.getValue("serial")}
        //     </div>
        //   </ScanItemDetailModal>
        // );
      },
    },
    {
      accessorKey: "pin",
      header: t("columns.pin"),
    },
    {
      accessorKey: "productCode",
      header: t("columns.productCode"),
      cell: ({ row }) => {
        return row.original.productCode || "-";
      },
    },
    {
      accessorKey: "registeredFlag",
      header: t("columns.verified"),
      cell: ({ row }) => {
        const registeredFlag =
          row.original.registeredFlag ?? ("" as string | null);
        return registeredFlag === "TRUE" ? (
          <CheckIcon className="size-4 text-green-500" />
        ) : null;
      },
    },
    {
      accessorKey: "url",
      header: t("columns.url"),
    },
    {
      accessorKey: "scanCount",
      header: () => {
        return <div className="text-center">{t("columns.scanCount")}</div>;
      },
      cell: ({ row }) => {
        return <div className="text-center">{row.getValue("scanCount")}</div>;
      },
    },
    {
      accessorKey: "scanItemActionName",
      header: t("columns.scanItemActionName"),
      cell: ({ row }) => {
        return row.original.scanItemActionName || "-";
      },
    },
    {
      accessorKey: "customerEmail",
      header: t("columns.customerEmail"),
      cell: ({ row }) => {
        return row.original.customerEmail || "-";
      },
    },
    {
      accessorKey: "folderName",
      header: t("columns.folderName"),
      cell: ({ row }) => {
        return row.original.folderName || "-";
      },
    },
    {
      header: t("columns.action"),
      cell: ({ row }) => {
        const [UnVerifyConfirmDialog, unVerifyConfirm] = Confirm({
          title: t("unverify.title"),
          message: t("unverify.message"),
          variant: "destructive",
        });
        const [DetachCustomerConfirmDialog, detachCustomerConfirm] = Confirm({
          title: t("detachCustomer.title"),
          message: t("detachCustomer.message"),
          variant: "destructive",
        });
        const [DetachProductConfirmDialog, detachProductConfirm] = Confirm({
          title: t("detachProduct.title"),
          message: t("detachProduct.message"),
          variant: "destructive",
        });
        const params = Params<{ orgId: string }>();

        const unVerifyScanItemMutate =
          unVerifyScanItemsApi.useDeleteScanItemsMutation(params.orgId);
        const detachCustomerMutate = detachScanItemToCustomerApi.useMutation();
        const detachProductMutate = detachScanItemFromProductApi.useDetachScanItemFromProduct();
        const getScanUrlDryRunApi = getScanItemUrlDryRunApi.useMutation();

        const handleUnVerify = async (scanId: string) => {
          const ok = await unVerifyConfirm();

          if (!ok) return;

          const toastId = toast.loading(t("unverify.loading"));

          try {
            await unVerifyScanItemMutate.mutateAsync(scanId, {
              onSuccess: ({ data }) => {
                if (data.status !== "OK") {
                  return toast.error(data.description, { id: toastId });
                }
                toast.success(t("unverify.success"), { id: toastId });
                queryClient.invalidateQueries({
                  queryKey: fetchScanItemsApi.fetchScanItemsKey,
                  refetchType: "active",
                });
              },
            });
          } catch (error) {
            console.error("error", error);
            toast.error(t("unverify.error"), { id: toastId });
          }
        };

        const handleDetachCustomer = async (scanId: string) => {
          const ok = await detachCustomerConfirm();

          if (!ok) return;

          const toastId = toast.loading(t("detachCustomer.loading"));

          try {
            await detachCustomerMutate.mutateAsync(
              {
                orgId: params.orgId,
                scanItemId: scanId,
              },
              {
                onSuccess: ({ data }) => {
                  if (data.status !== "OK" && data.status !== "SUCCESS") {
                    return toast.error(data.description, { id: toastId });
                  }
                  toast.success(t("detachCustomer.success"), { id: toastId });
                  queryClient.invalidateQueries({
                    queryKey: fetchScanItemsApi.fetchScanItemsKey,
                    refetchType: "active",
                  });
                },
              }
            );
          } catch (error) {
            console.error("error", error);
            toast.error(t("detachCustomer.error"), { id: toastId });
          }
        };

        const handleDetachProduct = async (scanId: string) => {
          const ok = await detachProductConfirm();

          if (!ok) return;

          const toastId = toast.loading(t("detachProduct.loading"));

          try {
            await detachProductMutate.mutateAsync(
              {
                orgId: params.orgId,
                scanItemId: scanId,
              },
              {
                onSuccess: ({ data }) => {
                  if (data.status !== "OK" && data.status !== "SUCCESS") {
                    return toast.error(data.description, { id: toastId });
                  }
                  toast.success(t("detachProduct.success"), { id: toastId });
                  queryClient.invalidateQueries({
                    queryKey: fetchScanItemsApi.fetchScanItemsKey,
                    refetchType: "active",
                  });
                },
              }
            );
          } catch (error) {
            console.error("error", error);
            toast.error(t("detachProduct.error"), { id: toastId });
          }
        };

        const [qrCodeModal, setQrCodeModal] = State({
          open: false,
          url: "",
        });

        return (
          <>
            <QrCodeModal
              open={qrCodeModal.open}
              onOpenChange={() => setQrCodeModal({ open: false, url: "" })}
              url={qrCodeModal.url}
            />
            <UnVerifyConfirmDialog />
            <DetachCustomerConfirmDialog />
            <DetachProductConfirmDialog />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {unVerifyScanItemMutate.isPending ||
                  detachCustomerMutate.isPending ||
                  detachProductMutate.isPending ? (
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
                  {t("actions.unVerifyScanItem")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => handleDetachCustomer(row.original.id)}
                >
                  {t("actions.detachCustomer")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => handleDetachProduct(row.original.id)}
                >
                  {t("actions.detachProduct")}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onSelect={() =>
                    router.push(
                      RouteConfig.GENERAL.CUSTOMER.LIST(row.original.orgId) +
                        `?scanItemId=${row.original.id}`
                    )
                  }
                >
                  {t("actions.bindToCustomer")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    router.push(
                      RouteConfig.GENERAL.PRODUCT.LIST(row.original.orgId) +
                        `?scanItemId=${row.original.id}`
                    )
                  }
                >
                  {t("actions.bindToProduct")}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  disabled={getScanUrlDryRunApi.isPending}
                  onSelect={() => {
                    getScanUrlDryRunApi.mutate(
                      {
                        orgId: row.original.orgId,
                        scanItemId: row.original.id,
                      },
                      {
                        onSuccess: ({ data }) => {
                          if (
                            data.status === "OK" ||
                            data.status === "SUCCESS"
                          ) {
                            if (data.scanItem?.url) {
                              window.open(data.scanItem.url);
                              return;
                            } else {
                              return toast.error("product url not found");
                            }
                          }

                          toast.error(data.description);
                        },
                      }
                    );
                  }}
                >
                  {t("actions.dryRun")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => {
                    getScanUrlDryRunApi.mutate(
                      {
                        orgId: row.original.orgId,
                        scanItemId: row.original.id,
                      },
                      {
                        onSuccess: ({ data }) => {
                          if (
                            data.status === "OK" ||
                            data.status === "SUCCESS"
                          ) {
                            if (data.scanItem?.url) {
                              setQrCodeModal({
                                open: true,
                                url: data.scanItem.url,
                              });
                              return;
                            } else {
                              return toast.error("product url not found");
                            }
                          }

                          toast.error(data.description);
                        },
                      }
                    );
                  }}
                >
                  {t("actions.scanQr")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
};
