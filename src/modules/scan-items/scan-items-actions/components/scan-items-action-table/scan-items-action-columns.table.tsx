"use client";

import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { IScanItemsAction, fetchScanItemsActionsApi } from "../../api/fetch-scan-items-actions.api";
import { Check, MoreHorizontalIcon, XIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RouteConfig } from "@/config/route.config";
import { useTranslation } from "react-i18next";
import { useConfirm as Confirm } from "@/hooks/use-confirm";
import { setDefaultScanItemsActionsApi } from "../../api/set-default-scan-items-actions.api";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

type ScanItemsActionTableColumns = ColumnDef<IScanItemsAction> & {
  accessorKey?: keyof IScanItemsAction;
};

export const useScanItemsActionTableColumns = (): ScanItemsActionTableColumns[] => {
  const { t } = useTranslation(["scan-items-action", "common"]);
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
      accessorKey: "actionName",
      header: t("columns.actionName"),
      cell: ({ row }) => {
        return (
          <Link
            className="text-primary hover:underline"
            href={RouteConfig.SCAN_ITEMS.ACTION.UPDATE(
              params.orgId,
              row.original.id
            )}
          >
            {row.original.actionName}
          </Link>
        );
      },
    },
    {
      accessorKey: "description",
      header: t("columns.description"),
      cell: ({ row }) => {
        return row.original.description || "-";
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
      accessorKey: "themeVerify",
      header: t("columns.themeVerify"),
      cell: ({ row }) => {
        return row.original.themeVerify || "-";
      },
    },
    {
      accessorKey: "redirectUrl",
      header: t("columns.redirectUrl"),
      cell: ({ row }) => {
        return row.original.redirectUrl || "-";
      },
    },
    {
      accessorKey: "isDefault",
      header: t("columns.isDefault"),
      cell: ({ row }) => {
        return row.original.isDefault === "YES" ? (
          <Check className="size-4 text-green-600" />
        ) : <XIcon className="size-4 text-destructive" />;
      },
    },
    {
      id: "actions",
      header: t("columns.action"),
      cell: ({ row }) => {
        const isDefault = row.original.isDefault === "YES";

        const [ConfirmSetDefaultDialog, confirmSetDefault] = Confirm({
          title: t("setDefault.title"),
          message: t("setDefault.message"),
          variant: "default",
        });

        const setDefaultAction = setDefaultScanItemsActionsApi.useSetDefaultScanItemsActions();

        const handleSetDefault = async (actionId: string) => {
          const ok = await confirmSetDefault();
          if (!ok) return;

          const toastId = toast.loading(t("setDefault.loading"));

          try {
            await setDefaultAction.mutateAsync(
              {
                orgId: params.orgId,
                scanItemsActionId: actionId,
              },
              {
                onSuccess: ({ data }) => {
                  if (data.status !== "OK") {
                    return toast.error(data.description, { id: toastId });
                  }

                  toast.success(t("setDefault.success"), { id: toastId });

                  // Invalidate query to refetch data
                  queryClient.invalidateQueries({
                    queryKey: fetchScanItemsActionsApi.key
                  });
                },
              }
            );
          } catch {
            toast.error(t("setDefault.error"), { id: toastId });
          }
        };

        return (
          <>
            <ConfirmSetDefaultDialog />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={isDefault}
                  onClick={() => {
                    handleSetDefault(row.original.id)
                  }}
                >
                  {t("actions.setDefault")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
};
