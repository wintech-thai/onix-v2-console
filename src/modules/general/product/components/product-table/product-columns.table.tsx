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

type productTableColumns = ColumnDef<IProduct> & {
  accessorKey?: keyof IProduct;
};

export const getProductTableColumns = (t: TFunction<"product">): productTableColumns[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        // onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={t("product.table.columns.selectAll")}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={t("product.table.columns.selectRow")}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: t("product.table.columns.code"),
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
    header: t("product.table.columns.description"),
  },
  {
    accessorKey: "tags",
    header: t("product.table.columns.tags"),
  },
  {
    header: t("product.table.columns.action"),
    cell: () => {
      const actions = [
        { key: "unVerify", label: t("product.table.actions.unVerify") },
        { key: "bindToCustomer", label: t("product.table.actions.bindToCustomer") },
        { key: "bindToProduct", label: t("product.table.actions.bindToProduct") },
      ];

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.key}
                onSelect={() => console.log(action.key)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    header: t("product.table.columns.productImage"),
    cell: ({ row }) => {
      const images = row.original.images[0];

      return images ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={images.imageUrl} alt={images.imagePath} />
      ) : (
        <span>{t("product.table.columns.noImage")}</span>
      )
    }
  }
];
