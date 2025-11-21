"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { IWallets } from "../../api/fetch-wallets.api";
import { MoreHorizontalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type WalletsTableColumns = ColumnDef<IWallets> & {
  accessorKey?: keyof IWallets;
};

export const useWalletsTableColumns = (
  onEdit: (id: string) => void
): WalletsTableColumns[] => {
  const { t } = useTranslation("wallets");

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
      accessorKey: "name",
      header: t("columns.name"),
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:underline text-primary font-medium"
          onClick={() => onEdit(row.original.id)}
        >
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: t("columns.description", "Description"),
      cell: ({ row }) => row.original.description || "-",
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
      accessorKey: "pointBalance",
      header: t("columns.balance", "Balance"),
      cell: ({ row }) => {
        const pointBalance = (row.original.pointBalance ?? 0).toLocaleString();

        return <div className="text-right w-[65px]">{pointBalance}</div>;
      },
    },
    {
      id: "actions",
      header: t("columns.action", "Action"),
      cell: ({ row }) => {
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    toast.info("Point Add action clicked (Not implemented)");
                  }}
                >
                  {t("actions.pointAdd", "Point Add")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    toast.info("Point Deduct action clicked (Not implemented)");
                  }}
                >
                  {t("actions.pointDeduct", "Point Deduct")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    toast.info(
                      "Point Transaction action clicked (Not implemented)"
                    );
                  }}
                >
                  {t("actions.pointTransaction", "Point Transaction")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
};
