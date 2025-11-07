"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { IProduct } from "../../api/fetch-products.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { RouteConfig } from "@/config/route.config";
import { TFunction } from "i18next";
import { useRouter as Router } from "next/navigation";

type productTableColumns = ColumnDef<IProduct> & {
  accessorKey?: keyof IProduct;
};

export const getProductTableColumns = (
  t: TFunction<"product", undefined>
): productTableColumns[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        // onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={t("table.columns.selectAll")}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={t("table.columns.selectRow")}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: t("table.columns.code"),
    cell: ({ row }) => {
      return (
        <Link
          href={RouteConfig.GENERAL.PRODUCT.UPDATE(
            row.original.orgId,
            row.original.id
          )}
          className="text-primary hover:underline"
        >
          {row.original.code}
        </Link>
      );
    },
  },
  {
    accessorKey: "description",
    header: t("table.columns.description"),
  },
  {
    accessorKey: "tags",
    header: t("table.columns.tags"),
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
    header: t("table.columns.action"),
    cell: ({ row }) => {
      const actions = [
        { key: "unVerify", label: t("table.actions.productImage") },
      ];

      const router = Router();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.key}
                onSelect={() => router.push(`${RouteConfig.GENERAL.PRODUCT.IMAGE(
                  row.original.orgId,
                  row.original.id
                )}?productName=${encodeURIComponent(row.original.description || row.original.code)}`)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
