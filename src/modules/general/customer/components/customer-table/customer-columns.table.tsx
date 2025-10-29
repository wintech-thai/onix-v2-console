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
import { useState as State } from "react";
import { UpdateCustomerEmailModal } from "../../components/modal/update-customer-email.modal";

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
            {row.original.code}
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
        return (
          <div className="text-right w-[65px]">{total.toLocaleString()}</div>
        );
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
      cell: ({ row }) => {
        const orgId = row.original.orgId;
        const customerId = row.original.id;
        const [modalOpen, setModalOpen] = State(false);
        const [modalMode, setModalMode] = State<"verify" | "update">("update");

        const handleOpenModal = (mode: "verify" | "update") => {
          setModalMode(mode);
          setModalOpen(true);
        };

        return (
          <>
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
                <DropdownMenuItem onClick={() => handleOpenModal("verify")}>
                  Verify Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenModal("update")}>
                  Update Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UpdateCustomerEmailModal
              isOpen={modalOpen}
              setOpen={setModalOpen}
              mode={modalMode}
              orgId={orgId}
              customerId={customerId}
            />
          </>
        );
      },
    },
  ];
};
