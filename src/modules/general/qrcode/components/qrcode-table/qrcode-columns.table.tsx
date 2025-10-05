"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { IScanItems } from "../../api/fetch-qrcodes.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckIcon, MoreHorizontalIcon } from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

type qrcodeTableColumns = ColumnDef<IScanItems> & {
  accessorKey?: keyof IScanItems;
};

export const useQrcodeTableColumns = (): qrcodeTableColumns[] => {
  const { t } = useTranslation();

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
      accessorKey: "serial",
      header: t("qrcode.columns.serial"),
      cell: ({ row }) => {
        return <div className="text-primary underline cursor-pointer">{row.getValue("serial")}</div>;
      }
    },
    {
      accessorKey: "pin",
      header: t("qrcode.columns.pin"),
    },
    {
      accessorKey: "registeredFlag",
      header: t("qrcode.columns.verified"),
      cell: ({ row }) => {
        const productCode = row.original.registeredFlag ?? "" as string | null;
        return productCode === "TRUE" ? <CheckIcon /> : null;
      },
    },
    {
      header: t("qrcode.columns.verifiedDate"),
      cell: ({ row }) => {
        const registeredFlag = row.original.registeredDate ?? "" as string;
        return registeredFlag ? dayjs(registeredFlag).format("DD MMM YYYY HH:mm [GMT] Z") : "-";
      },
    },
    {
      accessorKey: "productCode",
      header: t("qrcode.columns.productCode"),
    },
    {
      accessorKey: "url",
      header: t("qrcode.columns.url"),
    },
    {
      accessorKey: "scanCount",
      header: t("qrcode.columns.scanCount"),
    },
    {
      header: t("qrcode.columns.action"),
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => console.log("unVerifyScanItem")}>
                {t("qrcode.actions.unVerifyScanItem")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("bindToCustomer")}>
                {t("qrcode.actions.bindToCustomer")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("bindToProduct")}>
                {t("qrcode.actions.bindToProduct")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
