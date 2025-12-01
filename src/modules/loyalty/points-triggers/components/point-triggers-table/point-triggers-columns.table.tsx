"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { IPointTrigger } from "../../api/fetch-point-triggers.api";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RouteConfig } from "@/config/route.config";

export const usePointTriggerTableColumns = (): ColumnDef<IPointTrigger>[] => {
  const { t } = useTranslation(["point-trigger"]);
  const params = useParams<{ orgId: string }>();

  return [
    {
      accessorKey: "triggerName",
      header: t("table.triggerName"),
      cell: ({ row }) => {
        return (
          <Link
            href={RouteConfig.LOYALTY.POINT_TRIGGER.VIEW(
              params.orgId,
              row.original.id
            )}
            className="text-primary hover:underline font-medium"
          >
            {row.original.triggerName}
          </Link>
        );
      },
    },
    {
      accessorKey: "walletId",
      header: t("table.walletId"),
    },
    {
      accessorKey: "description",
      header: t("table.description"),
    },
    {
      accessorKey: "tags",
      header: t("table.tags"),
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
      accessorKey: "triggeredEvent",
      header: t("table.triggeredEvent"),
    },
    {
      accessorKey: "points",
      header: () => <div className="text-right">{t("table.point")}</div>,
      cell: ({ row }) => {
        const points = row.original.points;
        return <div className="text-right">{points.toLocaleString()}</div>;
      },
    },
    {
      accessorKey: "isRuleMatch",
      header: t("table.isMatch"),
      cell: ({ row }) => {
        const isMatch = row.original.isRuleMatch === "True";
        return (
          <div className="flex items-center">
            {isMatch ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
          </div>
        );
      },
    },
  ];
};
