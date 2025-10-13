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
    cell: ({ row }) => {
      return (
        <Link
          href={RouteConfig.GENERAL.PRODUCT.UPDATE(
            row.original.orgId,
            row.original.id
          )}
          className="underline text-primary"
        >
          {row.original.code}
        </Link>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "tags",
    header: "Tags",
  },
  {
    header: "Action",
    cell: () => {
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
  {
    header: "Product Image",
    cell: ({ row }) => {
      const images = row.original.images[0];

      return images ? (
        <img src={images.imageUrl} alt={images.imagePath} />
      ) : (
        <span>No Image</span>
      )
    }
  }
];
