"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { RouteConfig } from "@/config/route.config";
import { ICustomer } from "../../api/fetch-customer.api";
import { CheckIcon, MoreHorizontalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type CustomerTableColumns = ColumnDef<ICustomer> & {
  accessorKey?: keyof ICustomer;
};

export const useCustomerTableColumns = (): CustomerTableColumns[] => {
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
      accessorKey: "code",
      cell: ({ row }) => {
        return (
          <Link
            className="text-primary underline"
            href={RouteConfig.GENERAL.CUSTOMER.UPDATE(
              row.original.orgId,
              row.original.id
            )}
          >
            {row.original.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
    },
    {
      accessorKey: "primaryEmail",
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            {row.original.primaryEmail}{" "}
            {row.original.primaryEmailStatus === "VERIFIED" ? (
              <CheckIcon className="ml-2 size-4 text-green-500" />
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "totalPoint",
      cell: ({ row }) => {
        const total = row.original.totalPoint ?? 0;
        return <div className="text-right w-[65px]">{total.toLocaleString()}</div>;
      },
    },
    {
      accessorKey: "tags",
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
      header: "action",
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                Point Management
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => {}}>
                Verify Email
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => {}}>
                Edit Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
