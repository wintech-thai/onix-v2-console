"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { IJob } from "../../api/scan-item-template-job/fetch-scan-item-template-job.api";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { RouteConfig } from "@/config/route.config";
import dayjs from "dayjs";

type ScanItemTemplateJobTableColumns = ColumnDef<IJob> & {
  accessorKey?: keyof IJob;
};

export const useScanItemTemplateJobTableColumns = (): ScanItemTemplateJobTableColumns[] => {
  const { t } = useTranslation("cronjob");

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
      accessorKey: "createdDate",
      header: t("columns.createdDate"),
      cell: ({ row }) => {
        return (
          <Link
            className="text-primary hover:underline"
            href={RouteConfig.GENERAL.JOB.UPDATE(
              row.original.orgId,
              row.original.id
            )}
          >
            {dayjs(row.original.createdDate).format("DD MMM YYYY HH:mm [GMT] Z") }
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
      header: t("columns.name"),
    },
    {
      accessorKey: "description",
      header: t("columns.description"),
    },
    {
      accessorKey: "type",
      header: t("columns.type"),
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
      accessorKey: "status",
      header: t("columns.status"),
    },
  ];
};
