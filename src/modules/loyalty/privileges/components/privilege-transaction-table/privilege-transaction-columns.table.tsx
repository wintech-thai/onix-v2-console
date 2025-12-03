import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { IPrivilegeTx } from "../../api/get-privielge-tx-by-id.api";
import dayjs from "dayjs";

type PrivilegeTransactionTableColumns = ColumnDef<IPrivilegeTx> & {
  accessorKey?: keyof IPrivilegeTx;
};

export const usePrivilegeTransactionTableColumns = (): PrivilegeTransactionTableColumns[] => {
  const { t } = useTranslation("privileges");

  return [
    {
      accessorKey: "createdDate",
      header: t("transaction.columns.createdDate", "Created Date"),
      cell: ({ row }) =>
        dayjs(row.original.createdDate).format("DD MMM YYYY HH:mm [GMT] Z"),
    },
    {
      accessorKey: "tags",
      header: t("transaction.columns.tags", "Tags"),
      cell: ({ row }) => {
        if (!row.original.tags) return "-";
        return (
          <div className="max-w-[300px] w-full flex flex-wrap gap-x-0.5 gap-y-0.5">
            {row.original.tags.split(",").map((badge, i) => (
              <div
                key={i}
                className="bg-primary text-white rounded-lg px-2 py-1"
              >
                {badge.trim()}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: t("transaction.columns.description", "Description"),
      cell: ({ row }) => row.original.description || "-",
    },
    {
      accessorKey: "txAmount",
      header: () => {
        return (
          <div className="w-full text-center">
            {t("transaction.columns.txAmount", "Amount")}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-right">
          {(row.original.txAmount ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "txType",
      header: t("transaction.columns.txType", "Type"),
      cell: ({ row }) => {
        const type = row.original.txType;
        return (
          <div className="bg-primary text-white rounded-lg px-2 py-1 w-fit">
            {type === 1
              ? t("transaction.types.add", "Add")
              : t("transaction.types.deduct", "Deduct")}
          </div>
        );
      },
    },
    {
      accessorKey: "previousBalance",
      header: () => {
        return (
          <div className="w-full text-center">
            {t("transaction.columns.previousBalance", "Previous Balance")}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-right">
          {(row.original.previousBalance ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "currentBalance",
      header: () => {
        return (
          <div className="w-full text-center">
            {t("transaction.columns.currentBalance", "Current Balance")}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-right">
          {(row.original.currentBalance ?? 0).toLocaleString()}
        </div>
      ),
    },
  ];
};
