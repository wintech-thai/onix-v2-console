"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { IScanItemTemplate } from "../../api/fetch-scan-items-templates.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckIcon, MoreHorizontalIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { setDefaultScanItemsTemplatesApi } from "../../api/set-default-scan-items-templates.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchScanItemsTemplatesApi } from "../../api/fetch-scan-items-templates.api";
import Link from "next/link";
import { RouteConfig } from "@/config/route.config";
import { useConfirm as Confirm } from "@/hooks/use-confirm";

export const useScanItemsTemplateTableColumns =
  (): ColumnDef<IScanItemTemplate>[] => {
    const { t } = useTranslation("scan-items-template");
    const params = useParams<{ orgId: string }>();
    const queryClient = useQueryClient();

    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
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
        accessorKey: "templateName",
        header: t("columns.templateName"),
        cell: ({ row }) => {
          return (
            <Link
              href={RouteConfig.SCAN_ITEMS.TEMPLATE.UPDATE(
                row.original.orgId,
                row.original.id
              )}
              className="text-blue-600 hover:underline"
            >
              {row.getValue("templateName")}
            </Link>
          );
        },
      },
      {
        accessorKey: "description",
        header: t("columns.description"),
        cell: ({ row }) => {
          return (
            <div className="max-w-[300px] truncate">
              {row.getValue("description")}
            </div>
          );
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
        accessorKey: "serialPrefixDigit",
        header: t("columns.prefixDigit"),
        cell: ({ row }) => {
          return (
            <div className="text-center">
              {row.getValue("serialPrefixDigit")}
            </div>
          );
        },
      },
      {
        accessorKey: "generatorCount",
        header: t("columns.quantity"),
        cell: ({ row }) => {
          const value = row.getValue("generatorCount") as number;
          return (
            <div className="text-right">
              {value ? Number(value).toLocaleString() : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "pinDigit",
        header: t("columns.pinDigit"),
        cell: ({ row }) => {
          return <div className="text-center">{row.getValue("pinDigit")}</div>;
        },
      },
      {
        accessorKey: "serialDigit",
        header: t("columns.serialDigit"),
        cell: ({ row }) => {
          return (
            <div className="text-center">{row.getValue("serialDigit")}</div>
          );
        },
      },
      {
        accessorKey: "urlTemplate",
        header: t("columns.urlTemplate"),
        cell: ({ row }) => {
          return (
            <div className="max-w-[200px] truncate text-blue-600">
              {row.getValue("urlTemplate")}
            </div>
          );
        },
      },
      {
        accessorKey: "isDefault",
        header: t("columns.isDefault"),
        cell: ({ row }) => {
          const isDefault = row.getValue("isDefault") === "TRUE";
          return (
            <div className="flex justify-center">
              {isDefault && <CheckIcon className="h-5 w-5 text-green-600" />}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: t("columns.action"),
        cell: ({ row }) => {
          const isDefault = row.original.isDefault === "TRUE";

          const [ConfirmSetDefaultDialog, confirmSetDefault] = Confirm({
            variant: "default",
            title: t("setDefault.confirmTitle"),
            message: t("setDefault.confirmMessage"),
          });

          const setDefaultMutation =
            setDefaultScanItemsTemplatesApi.useSetDefaultScanItemsTemplates();

          const handleSetDefault = async (templateId: string) => {
            const ok = await confirmSetDefault();

            if (!ok) return;

            const toastId = toast.loading(t("setDefault.loading"));

            try {
              await setDefaultMutation.mutateAsync(
                {
                  orgId: params.orgId,
                  templateId: templateId,
                },
                {
                  onSuccess: ({ data }) => {
                    if (data.status !== "OK") {
                      return toast.error(data.description, { id: toastId });
                    }

                    toast.success(t("setDefault.success"), { id: toastId });

                    // Invalidate queries to refresh the data
                    queryClient.invalidateQueries({
                      queryKey: [fetchScanItemsTemplatesApi.key],
                      refetchType: "active",
                    });
                  },
                }
              );
            } catch (error) {
              toast.error(t("setDefault.error"), { id: toastId });
              console.error("Failed to set default:", error);
            }
          };

          return (
            <>
              <ConfirmSetDefaultDialog />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={isDefault || setDefaultMutation.isPending}
                    onClick={() => handleSetDefault(row.original.id)}
                  >
                    {t("action.setAsDefault")}
                  </DropdownMenuItem>
                  <Link
                    href={RouteConfig.SCAN_ITEMS.TEMPLATE.CREATE_JOB(
                      row.original.orgId,
                      row.original.id
                    )}
                  >
                    <DropdownMenuItem>
                      {t("action.createScanItemJob")}
                    </DropdownMenuItem>
                  </Link>
                  <Link
                    href={RouteConfig.SCAN_ITEMS.TEMPLATE.LIST_JOBS(
                      row.original.orgId,
                      row.original.id
                    )}
                  >
                    <DropdownMenuItem>
                      {t("action.scanItemJobs")}
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          );
        },
      },
    ];
  };
