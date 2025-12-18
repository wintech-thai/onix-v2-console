"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { IScanItemsFolder } from "../../api/scan-items-service";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { RouteConfig } from "@/config/route.config";
import Link from "next/link";

export const useScanItemsFolderTableColumns =
  (): ColumnDef<IScanItemsFolder>[] => {
    const { t } = useTranslation("scan-items-folder");
    const params = useParams<{ orgId: string }>();
    const router = useRouter();

    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
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
        accessorKey: "folderName",
        header: t("columns.folderName"),
        cell: ({ row }) => {
          return (
            <Link
              className="text-primary hover:underline"
              href={RouteConfig.SCAN_ITEMS.FOLDER.UPDATE(
                row.original.orgId,
                row.original.id
              )}
            >
              {row.original.folderName || "-"}
            </Link>
          );
        },
      },
      {
        accessorKey: "description",
        header: t("columns.description"),
        cell: ({ row }) => {
          return (
            <div className="max-w-[300px] truncate">
              {row.getValue("description")}
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
        accessorKey: "scanItemActionName",
        header: t("columns.actionName"),
        cell: ({ row }) => {
          return (
            <div className="max-w-[200px] truncate">
              {row.getValue("scanItemActionName")}
            </div>
          );
        },
      },
      {
        accessorKey: "productCode",
        header: t("columns.productCode"),
        cell: ({ row }) => {
          return (
            <div className="text-center">{row.getValue("productCode")}</div>
          );
        },
      },
      {
        accessorKey: "productDesc",
        header: t("columns.productDesc"),
        cell: ({ row }) => {
          return (
            <div className="max-w-[200px] truncate">
              {row.getValue("productDesc")}
            </div>
          );
        },
      },
      {
        accessorKey: "scanItemCount",
        header: t("columns.scanItemCount"),
        cell: ({ row }) => {
          const value = row.getValue("scanItemCount") as number;
          return (
            <div className="text-right">
              {value ? Number(value).toLocaleString() : "-"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: t("columns.action"),
        cell: ({ row }) => {
          const folderId = row.original.id;

          const handleAttachToProduct = () => {
            router.push(
              `${RouteConfig.GENERAL.PRODUCT.LIST(
                params.orgId
              )}?folderId=${folderId}`
            );
          };

          const handleAttachToAction = () => {
            router.push(
              `${RouteConfig.SCAN_ITEMS.ACTION.LIST(
                params.orgId
              )}?folderId=${folderId}`
            );
          };

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAttachToProduct}>
                  {t("action.attachToProduct")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAttachToAction}>
                  {t("action.attachToAction")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  };
