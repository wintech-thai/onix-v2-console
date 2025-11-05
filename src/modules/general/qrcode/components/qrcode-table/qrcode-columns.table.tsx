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
import { ScanItemDetailModal } from "../modal/scan-item-detial.modal";
import { RouteConfig } from "@/config/route.config";
import { getScanItemUrlDryRunApi } from "../../api/get-scan-item-url-dry-run.api";
import { QrCodeModal } from "../modal/qrcode-modal";
import { useState as State } from "react";

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
          <ScanItemDetailModal
            orgId={row.original.orgId}
            scanItemId={row.original.id}
          >
            <div className="text-primary hover:underline cursor-pointer">
              {row.getValue("serial")}
            </div>
          </ScanItemDetailModal>
        );
      },
    },
    {
      accessorKey: "pin",
      header: t("columns.pin"),
    },
    {
      accessorKey: "registeredFlag",
      header: t("columns.verified"),
      cell: ({ row }) => {
        const productCode =
          row.original.registeredFlag ?? ("" as string | null);
        return productCode === "TRUE" ? (
          <CheckIcon className="size-4 text-green-500" />
        ) : null;
      },
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
      header: t("columns.action"),
      cell: ({ row }) => {
        const [UnVerifyConfirmDialog, unVerifyConfirm] = Confirm({
          title: t("unverify.title"),
          message: t("unverify.message"),
          variant: "destructive",
        });
        const params = Params<{ orgId: string }>();

        const unVerifyScanItemMutate =
          unVerifyScanItemsApi.useDeleteScanItemsMutation(params.orgId);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
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
                  {t("actions.unVerifyScanItem")}
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
