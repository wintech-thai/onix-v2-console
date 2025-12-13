"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { IScanItemTemplate } from "../../api/fetch-scan-items-templates.api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckIcon, MoreHorizontalIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { setDefaultScanItemsTemplatesApi } from "../../api/set-default-scan-items-templates.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchScanItemsTemplatesApi } from "../../api/fetch-scan-items-templates.api";
import Link from "next/link";

export const useScanItemsTemplateTableColumns = (): ColumnDef<IScanItemTemplate>[] => {
  const { t } = useTranslation("scan-items-template");
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();
  const setDefaultMutation = setDefaultScanItemsTemplatesApi.useSetDefaultScanItemsTemplates();

  const handleSetDefault = async (templateId: string) => {
    const toastId = toast.loading(t("setDefault.title"));

    try {
      await setDefaultMutation.mutateAsync({
        orgId: params.orgId,
        templateId: templateId,
      });

      toast.dismiss(toastId);
      toast.success(t("setDefault.success"));

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({
        queryKey: [fetchScanItemsTemplatesApi.key],
        refetchType: "active",
      });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(t("setDefault.error"));
      console.error("Failed to set default:", error);
    }
  };

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      accessorKey: "templateName",
      header: t("columns.templateName"),
      cell: ({ row }) => {
        return (
          <Link
            href={`/${params.orgId}/scan-items/scan-items-templates/update/${row.original.id}`}
            className="text-blue-600 hover:underline"
          >
            {row.getValue("templateName")}
          </Link>
        );
      },
    },
    {
      accessorKey: "description",
      header: t("columns.description"),
      cell: ({ row }) => {
        return <div className="max-w-[300px] truncate">{row.getValue("description")}</div>;
      },
    },
    {
      accessorKey: "tags",
      header: t("columns.tags"),
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string;
        const tagArray = tags ? tags.split(",").filter((tag) => tag.trim() !== "") : [];

        if (tagArray.length === 0) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="flex flex-wrap gap-1">
            {tagArray.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
            {tagArray.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
                +{tagArray.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "serialPrefixDigit",
      header: t("columns.prefixDigit"),
      cell: ({ row }) => {
        return <div className="text-center">{row.getValue("serialPrefixDigit")}</div>;
      },
    },
    {
      accessorKey: "generatorCount",
      header: t("columns.quantity"),
      cell: ({ row }) => {
        const value = row.getValue("generatorCount") as number;
        return <div className="text-right">{value ? Number(value).toLocaleString() : "-"}</div>;
      },
    },
    {
      accessorKey: "pinDigit",
      header: t("columns.pinDigit"),
      cell: ({ row }) => {
        return <div className="text-center">{row.getValue("pinDigit")}</div>;
      },
    },
    {
      accessorKey: "serialDigit",
      header: t("columns.serialDigit"),
      cell: ({ row }) => {
        return <div className="text-center">{row.getValue("serialDigit")}</div>;
      },
    },
    {
      accessorKey: "urlTemplate",
      header: t("columns.urlTemplate"),
      cell: ({ row }) => {
        return <div className="max-w-[200px] truncate text-blue-600">{row.getValue("urlTemplate")}</div>;
      },
    },
    {
      accessorKey: "isDefault",
      header: t("columns.isDefault"),
      cell: ({ row }) => {
        const isDefault = row.getValue("isDefault") === "TRUE";
        return (
          <div className="flex justify-center">
            {isDefault && <CheckIcon className="h-5 w-5 text-green-600" />}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("columns.action"),
      cell: ({ row }) => {
        const isDefault = row.original.isDefault === "TRUE";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={isDefault || setDefaultMutation.isPending}
                onClick={() => handleSetDefault(row.original.id)}
              >
                {t("action.setAsDefault")}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                {t("action.createScanItemJob")}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                {t("action.scanItemJobs")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
