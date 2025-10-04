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

type productTableColumns = ColumnDef<IProduct> & {
  accessorKey?: keyof IProduct;
};

export const productTableColumns: productTableColumns[] = [
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
    header: "Product Code",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "itemType",
    header: "Item Type",
    cell: ({ row }) => {
      const itemType = row.getValue("itemType") as number;
      return itemType === 0 ? "Product" : "Service";
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
  },
  {
    accessorKey: "createdDate",
    header: "Created Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdDate"));
      return date.toLocaleDateString();
    },
  },
  {
    header: "Action",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["Un-Verify Scan Item", "Bind to Customer", "Bind To Product"].map(
              (items) => {
                return (
                  <DropdownMenuItem
                    key={items}
                    onSelect={() => console.log(items)}
                  >
                    {items}
                  </DropdownMenuItem>
                );
              }
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
