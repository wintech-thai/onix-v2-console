"use client";

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
import Link from "next/link";
import { RouteConfig } from "@/config/route.config";

type UserTableColumns = ColumnDef<IUser> & {
  accessorKey?: keyof IUser;
};

export const useUserTableColumns = (): UserTableColumns[] => {
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
      header: "Username",
      cell: ({ row }) => {
        return (
          <Link className="text-primary underline" href={RouteConfig.ADMIN.USER.CREATE(row.original.orgUserId)}>
            {row.original.userName}
          </Link>
        )
      }
    },
    {
      accessorKey: "userEmail",
      header: "Email",
    },
    {
      accessorKey: "rolesList",
      header: "Role",
    },
    {
      accessorKey: "isOrgInitialUser",
      header: "IsOrgInitialUser",
      cell: ({ row }) => {
        return row.original.isOrgInitialUser ? (
          <Check className="size-4 text-green-600" />
        ) : (
          <X className="size-4 text-red-600" />
        );
      },
    },
    {
      accessorKey: "userStatus",
      header: "UserStatus",
    },
    {
      id: "actions",
      header: "Action",
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
                Disable User
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!isInactive}
                onClick={() => {
                  // TODO: Implement enable user API call
                  console.log("Enable user:", row.original.userId);
                }}
              >
                Enable User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
