"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { IAuditLog } from "../../api/fetch-audit-logs.api";
import { Button } from "@/components/ui/button";

type AuditLogTableColumns = ColumnDef<IAuditLog> & {
  accessorKey?: keyof IAuditLog;
};

interface UseAuditLogTableColumnsProps {
  onViewDetails: (log: IAuditLog) => void;
}

export const useAuditLogTableColumns = ({
  onViewDetails,
}: UseAuditLogTableColumnsProps): AuditLogTableColumns[] => {
  return [
    {
      accessorKey: "timestamp",
      header: "Time",
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
      header: "Username",
      cell: ({ row }) => {
        return row.original.username || "-";
      },
    },
    {
      accessorKey: "identityType",
      header: "Id Type",
      cell: ({ row }) => {
        return row.original.identityType || "-";
      },
    },
    {
      accessorKey: "apiName",
      header: "API",
      cell: ({ row }) => {
        return row.original.apiName || "-";
      },
    },
    {
      accessorKey: "statusCode",
      header: "Status",
      cell: ({ row }) => {
        return row.original.statusCode ?? "-";
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        return row.original.role || "-";
      },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => {
        return row.original.ipAddress || "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(row.original)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];
};
