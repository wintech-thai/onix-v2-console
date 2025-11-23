import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { IPoints } from "../../api/fetch-points.api";
import dayjs from "dayjs";

type PointsTableColumns = ColumnDef<IPoints> & {
  accessorKey?: keyof IPoints;
};

export const usePointsTableColumns = (): PointsTableColumns[] => {
  const { t } = useTranslation("wallets");

  return [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && "indeterminate")
    //       }
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: "createdDate",
      header: t("points.columns.createdDate", "Created Date"),
      cell: ({ row }) =>
        dayjs(row.original.createdDate).format("DD MMM YYYY HH:mm [GMT] Z"),
    },
    {
      accessorKey: "tags",
      header: t("points.columns.tags", "Tags"),
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
      header: t("points.columns.description", "Description"),
      cell: ({ row }) => row.original.description || "-",
    },
    {
      accessorKey: "txAmount",
      header: () => {
        return (
          <div className="w-full text-center">
            {t("points.columns.txAmount", "Amount")}
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
      header: t("points.columns.txType", "Type"),
      cell: ({ row }) => {
        const type = row.original.txType;
        return (
          <div className="bg-primary text-white rounded-lg px-2 py-1 w-fit">
            {type === 1
              ? t("points.types.add", "Add")
              : t("points.types.deduct", "Deduct")}
          </div>
        );
      },
    },
    {
      accessorKey: "previousBalance",
      header: () => {
        return (
          <div className="w-full text-center">
            {t("points.columns.previousBalance", "Previous Balance")}
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
            {t("points.columns.currentBalance", "Current Balance")}
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
