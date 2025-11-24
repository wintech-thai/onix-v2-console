"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { IPointRule } from "../../api/fetch-point-rules.api";
import { MoreHorizontalIcon, CheckIcon, XIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RouteConfig } from "@/config/route.config";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchPointRuleApi } from "../../api/fetch-point-rules.api";
import { useConfirm as Confirm } from "@/hooks/use-confirm";
import { enabledPointRuleApi } from "../../api/enabled-point-rules.api";
import { disabledPointRuleApi } from "../../api/disabled-point-rules.api";
import dayjs from "dayjs";

type PointRuleTableColumns = ColumnDef<IPointRule> & {
  accessorKey?: keyof IPointRule;
};

export const usePointRuleTableColumns = (): PointRuleTableColumns[] => {
  const { t } = useTranslation("point-rule");
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
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      accessorKey: "ruleName",
      header: t("columns.ruleName"),
      cell: ({ row }) => {
        return (
          <Link
            className="text-primary hover:underline"
            href={RouteConfig.LOYALTY.POINT_RULE.UPDATE(
              params.orgId,
              row.original.id
            )}
          >
            {row.original.ruleName || "-"}
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
        const tags = row.original.tags;

        if (!tags) return "-";

        return (
          <div className="max-w-[300px] w-full flex flex-wrap gap-x-0.5 gap-y-0.5">
            {tags.split(",").map((tag, i) => {
              return (
                <div
                  key={i}
                  className="bg-primary text-white rounded-lg px-2 py-1 cursor-pointer text-xs"
                >
                  {tag.trim()}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "triggeredEvent",
      header: t("columns.event"),
      cell: ({ row }) => {
        return row.original.triggeredEvent || "-";
      },
    },
    {
      accessorKey: "startDate",
      header: t("columns.startDate"),
      cell: ({ row }) => {
        return row.original.startDate
          ? dayjs(row.original.startDate).format("DD MMM YYYY HH:mm [GMT] Z")
          : "-";
      },
    },
    {
      accessorKey: "endDate",
      header: t("columns.endDate"),
      cell: ({ row }) => {
        return row.original.endDate
          ? dayjs(row.original.endDate).format("DD MMM YYYY HH:mm [GMT] Z")
          : "-";
      },
    },
    {
      accessorKey: "priority",
      header: t("columns.priority"),
      cell: ({ row }) => {
        return row.original.priority ?? "-";
      },
    },
    {
      accessorKey: "status",
      header: t("columns.status"),
      cell: ({ row }) => {
        const isActive = row.original.status === "Active";
        return isActive ? (
          <CheckIcon className="text-green-500 size-5" />
        ) : (
          <XIcon className="text-red-500 size-5" />
        );
      },
    },
    {
      id: "actions",
      header: t("columns.action"),
      cell: ({ row }) => {
        const status = row.original.status;
        const isActive = status === "Active";
        const isInactive = status === "Disable";

        const [ConfirmEnableDialog, confirmEnable] = Confirm({
          title: t("enable.title"),
          message: t("enable.message"),
          variant: "default",
        });

        const [ConfirmDisableDialog, confirmDisable] = Confirm({
          title: t("disable.title"),
          message: t("disable.message"),
          variant: "destructive",
        });

        const enablePointRule = enabledPointRuleApi.useEnablePointRule();
        const disablePointRule = disabledPointRuleApi.useDisablePointRule();

        const handleEnablePointRule = async (pointRuleId: string) => {
          const ok = await confirmEnable();
          if (!ok) return;

          const toastId = toast.loading(t("enable.loading"));

          try {
            await enablePointRule.mutateAsync(
              {
                orgId: params.orgId,
                pointRuleId: pointRuleId,
              },
              {
                onSuccess: ({ data }) => {
                  if (data.status !== "OK" && data.status !== "SUCCESS") {
                    return toast.error(data.description, { id: toastId });
                  }

                  toast.success(t("enable.success"), { id: toastId });

                  // Invalidate query to refetch data
                  queryClient.invalidateQueries({
                    queryKey: [fetchPointRuleApi.key],
                  });
                },
              }
            );
          } catch {
            toast.error(t("enable.error"), { id: toastId });
          }
        };

        const handleDisablePointRule = async (pointRuleId: string) => {
          const ok = await confirmDisable();
          if (!ok) return;

          const toastId = toast.loading(t("disable.loading"));

          try {
            await disablePointRule.mutateAsync(
              {
                orgId: params.orgId,
                pointRuleId: pointRuleId,
              },
              {
                onSuccess: ({ data }) => {
                  if (data.status !== "OK" && data.status !== "SUCCESS") {
                    return toast.error(data.description, { id: toastId });
                  }

                  toast.success(t("disable.success"), { id: toastId });

                  // Invalidate query to refetch data
                  queryClient.invalidateQueries({
                    queryKey: [fetchPointRuleApi.key],
                  });
                },
              }
            );
          } catch {
            toast.error(t("disable.error"), { id: toastId });
          }
        };

        return (
          <>
            <ConfirmDisableDialog />
            <ConfirmEnableDialog />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={!isActive}
                  onSelect={() => {
                    handleDisablePointRule(row.original.id);
                  }}
                >
                  {t("actions.disablePointRule")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!isInactive}
                  onSelect={() => {
                    handleEnablePointRule(row.original.id);
                  }}
                >
                  {t("actions.enablePointRule")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
};
