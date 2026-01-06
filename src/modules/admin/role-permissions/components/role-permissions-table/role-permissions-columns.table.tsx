"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { IRolePermissions } from "../../api/role-permissions.service";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { RouteConfig } from "@/config/route.config";

export const useRolePermissionsTableColumns =
  (): ColumnDef<IRolePermissions>[] => {
    const { t } = useTranslation("role-permissions");

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
        accessorKey: "roleName",
        header: t("columns.roleName"),
        cell: ({ row }) => {
          return (
            <Link
              className="text-primary hover:underline"
              href={RouteConfig.ADMIN.ROLE_PERMISSIONS.UPDATE(
                row.original.orgId,
                row.original.roleId
              )}
            >
              {row.original.roleName}
            </Link>
          );
        },
      },
      {
        accessorKey: "roleDescription",
        header: t("columns.description"),
        cell: ({ row }) => {
          return (
            <div className="max-w-[300px] truncate">
              {row.getValue("roleDescription") || "-"}
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
        id: "actions",
        header: t("columns.action"),
        cell: () => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              {/* <DropdownMenuContent align="end">
              </DropdownMenuContent> */}
            </DropdownMenu>
          );
        },
      },
    ];
  };
