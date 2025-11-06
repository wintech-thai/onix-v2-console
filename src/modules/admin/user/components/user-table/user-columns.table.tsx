"use client";

import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { IUser } from "../../api/fetch-users.api";
import { Check, MoreHorizontalIcon, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RouteConfig } from "@/config/route.config";
import { useTranslation } from "react-i18next";

type UserTableColumns = ColumnDef<IUser> & {
  accessorKey?: keyof IUser;
};

export const useUserTableColumns = (): UserTableColumns[] => {
  const { t } = useTranslation("user");

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
      accessorKey: "userName",
      header: t("columns.username"),
      cell: ({ row }) => {
        return (
          <Link
            className="text-primary hover:underline block"
            href={RouteConfig.ADMIN.USER.UPDATE(
              row.original.orgCustomId,
              row.original.orgUserId
            )}
          >
            {row.original.userName}
          </Link>
        );
      },
    },
    {
      accessorKey: "tmpUserEmail",
      header: t("columns.email"),
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
      accessorKey: "rolesList",
      header: t("columns.role"),
      cell: ({ row }) => {
        const role = row.original.rolesList;

        if (!role) return "-";

        return (
          <div className="max-w-[300px] w-full flex flex-wrap gap-x-0.5 gap-y-0.5">
            {role.split(",").map((badge, i) => {
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
      accessorKey: "isOrgInitialUser",
      header: t("columns.isOrgInitialUser"),
      cell: ({ row }) => {
        return row.original.isOrgInitialUser === "YES" ? (
          <Check className="size-4 text-green-600" />
        ) : (
          <X className="size-4 text-red-600" />
        );
      },
    },
    {
      accessorKey: "userStatus",
      header: t("columns.userStatus"),
    },
    {
      id: "actions",
      header: t("columns.action"),
      cell: ({ row }) => {
        const userStatus = row.original.userStatus;
        const isActive = userStatus === "Active";
        const isInactive = userStatus === "Inactive";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={!isActive}
                onClick={() => {
                  // TODO: Implement disable user API call
                  console.log("Disable user:", row.original.userId);
                }}
              >
                {t("actions.disableUser")}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!isInactive}
                onClick={() => {
                  // TODO: Implement enable user API call
                  console.log("Enable user:", row.original.userId);
                }}
              >
                {t("actions.enableUser")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
