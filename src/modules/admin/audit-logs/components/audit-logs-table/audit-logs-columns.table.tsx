"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { IAuditLog } from "../../api/fetch-audit-logs.api";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type AuditLogTableColumns = ColumnDef<IAuditLog> & {
  accessorKey?: keyof IAuditLog;
};

interface UseAuditLogTableColumnsProps {
  onViewDetails: (log: IAuditLog) => void;
}

export const useAuditLogTableColumns = ({
  onViewDetails,
}: UseAuditLogTableColumnsProps): AuditLogTableColumns[] => {
  const { t } = useTranslation("audit-log");
  
  return [
    {
      accessorKey: "timestamp",
      header: t("table.columns.time"),
      cell: ({ row }) => {
        const timestamp = row.original.timestamp;
        if (!timestamp) return "-";
        const d = new Date(timestamp);
        if (Number.isNaN(d.getTime())) return timestamp;
        return d.toLocaleString();
      },
    },
    {
      accessorKey: "username",
      header: t("table.columns.username"),
      cell: ({ row }) => {
        return row.original.username || "-";
      },
    },
    {
      accessorKey: "identityType",
      header: t("table.columns.identityType"),
      cell: ({ row }) => {
        return row.original.identityType || "-";
      },
    },
    {
      accessorKey: "apiName",
      header: t("table.columns.apiName"),
      cell: ({ row }) => {
        return row.original.apiName || "-";
      },
    },
    {
      accessorKey: "statusCode",
      header: t("table.columns.statusCode"),
      cell: ({ row }) => {
        return row.original.statusCode ?? "-";
      },
    },
    {
      accessorKey: "role",
      header: t("table.columns.role"),
      cell: ({ row }) => {
        return row.original.role || "-";
      },
    },
    {
      accessorKey: "ipAddress",
      header: t("table.columns.ipAddress"),
      cell: ({ row }) => {
        return row.original.ipAddress || "-";
      },
    },
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(row.original)}
            title={t("table.viewDetails")}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];
};
