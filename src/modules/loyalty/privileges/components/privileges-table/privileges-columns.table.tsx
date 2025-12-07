"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { IPrivileges } from "../../api/fetch-privileges.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import Link from "next/link";
import { RouteConfig } from "@/config/route.config";
import { useState } from "react";
import { PrivilegeQuotaModal } from "../privilege-quota-modal/privilege-quota-modal";
import { useParams, useRouter } from "next/navigation";

type PrivilegesTableColumns = ColumnDef<IPrivileges> & {
  accessorKey?: keyof IPrivileges;
};

export const usePrivilegesTableColumns = (): PrivilegesTableColumns[] => {
  const { t } = useTranslation("privileges");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    privilegeId: string | null;
    mode: "add" | "deduct";
    privilegeCode: string;
    currentBalance: number;
  }>({
    isOpen: false,
    privilegeId: null,
    mode: "add",
    privilegeCode: "",
    currentBalance: 0,
  });

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
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
      accessorKey: "code",
      header: t("columns.code"),
      cell: ({ row }) => {
        return (
          <Link
            className="text-primary hover:underline"
            href={RouteConfig.LOYALTY.PRIVILEGES.UPDATE(
              row.original.orgId,
              row.original.id
            )}
          >
            {row.original.code}
          </Link>
        );
      },
    },
    {
      accessorKey: "description",
      header: t("columns.description"),
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
                  className="bg-primary text-white rounded-lg px-2 py-1 cursor-pointer text-xs"
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
      accessorKey: "effectiveDate",
      header: t("columns.startDate"),
      cell: ({ row }) => {
        return row.original.effectiveDate
          ? dayjs(row.original.effectiveDate).format(
              "DD MMM YYYY HH:mm [GMT] Z"
            )
          : "-";
      },
    },
    {
      accessorKey: "expireDate",
      header: t("columns.endDate"),
      cell: ({ row }) => {
        return row.original.expireDate
          ? dayjs(row.original.expireDate).format("DD MMM YYYY HH:mm [GMT] Z")
          : "-";
      },
    },
    {
      accessorKey: "status",
      header: t("columns.status"),
    },
    {
      accessorKey: "currentBalance",
      header: t("columns.remainingQuota"),
      cell: ({ row }) => {
        const balance = row.original.currentBalance ?? 0;
        return (
          <div className="text-right w-[80px]">{balance.toLocaleString()}</div>
        );
      },
    },
    {
      id: "actions",
      header: () => {
        return (
          <>
            {t("columns.action")}
            <PrivilegeQuotaModal
              isOpen={modalState.isOpen}
              onClose={() =>
                setModalState({
                  isOpen: false,
                  privilegeId: null,
                  mode: "add",
                  privilegeCode: "",
                  currentBalance: 0,
                })
              }
              privilegeId={modalState.privilegeId}
              mode={modalState.mode}
              privilegeCode={modalState.privilegeCode}
              currentBalance={modalState.currentBalance}
            />
          </>
        );
      },
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  setModalState({
                    isOpen: true,
                    privilegeId: row.original.id,
                    mode: "add",
                    privilegeCode: row.original.code,
                    currentBalance: row.original.currentBalance ?? 0,
                  })
                }
              >
                {t("actions.addQuota")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setModalState({
                    isOpen: true,
                    privilegeId: row.original.id,
                    mode: "deduct",
                    privilegeCode: row.original.code,
                    currentBalance: row.original.currentBalance ?? 0,
                  })
                }
              >
                {t("actions.deductQuota")}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    RouteConfig.LOYALTY.PRIVILEGES.TX(
                      params.orgId,
                      row.original.id
                    )
                  )
                }
              >
                {t("actions.transaction")}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={row.original.status !== "Approve"}
                onClick={() =>
                  router.push(
                    RouteConfig.LOYALTY.VOUCHERS.REDEEM(
                      params.orgId,
                      row.original.id
                    )
                  )
                }
              >
                {t("actions.redeem")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
