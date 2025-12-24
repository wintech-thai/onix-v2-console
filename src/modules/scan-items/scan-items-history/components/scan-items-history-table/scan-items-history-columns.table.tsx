"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { IScanItemHistory } from "../../api/fetch-scan-items-history.api";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type ScanItemHistoryTableColumns = ColumnDef<IScanItemHistory> & {
  accessorKey?: keyof IScanItemHistory;
};

interface UseScanItemHistoryTableColumnsProps {
  onViewDetails: (item: IScanItemHistory) => void;
}

export const useScanItemHistoryTableColumns = ({
  onViewDetails,
}: UseScanItemHistoryTableColumnsProps): ScanItemHistoryTableColumns[] => {
  const { t } = useTranslation("scan-items-history");
  return [
    {
      accessorKey: "timestamp",
      header: t("table.columns.timestamp"),
      cell: ({ row }) => {
        const timestamp = row.original.timestamp;
        if (!timestamp) return "-";
        const d = new Date(timestamp);
        if (Number.isNaN(d.getTime())) return timestamp;
        return d.toLocaleString();
      },
    },
    {
      accessorKey: "serial",
      header: "Serial",
      cell: ({ row }) => {
        return row.original.serial || "-";
      },
    },
    {
      accessorKey: "pin",
      header: "Pin",
      cell: ({ row }) => {
        return row.original.pin || "-";
      },
    },
    {
      accessorKey: "customerEmail",
      header: t("table.columns.customerEmail"),
      cell: ({ row }) => {
        return row.original.customerEmail || "-";
      },
    },
    {
      accessorKey: "productCode",
      header: t("table.columns.productCode"),
      cell: ({ row }) => {
        return row.original.productCode || "-";
      },
    },
    {
      accessorKey: "folderName",
      header: t("table.columns.folderName"),
      cell: ({ row }) => {
        return row.original.folderName || "-";
      },
    },
    {
      accessorKey: "country",
      header: t("table.columns.country"),
      cell: ({ row }) => {
        return row.original.country || "-";
      },
    },
    {
      accessorKey: "province",
      header: t("table.columns.province"),
      cell: ({ row }) => {
        return row.original.province || "-";
      },
    },
    {
      id: "actions",
      header: t("table.columns.action"),
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(row.original)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];
};
