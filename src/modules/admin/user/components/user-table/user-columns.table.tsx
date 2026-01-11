"use client";

import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { fetchUsersApi, IUser } from "../../api/fetch-users.api";
import { Check, MoreHorizontalIcon, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RouteConfig } from "@/config/route.config";
import { useTranslation } from "react-i18next";
import { useConfirm as Confirm } from "@/hooks/use-confirm";
import { enabledUserApi } from "../../api/enabled-user.api";
import { disabledUserApi } from "../../api/disabled-user.api";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

type UserTableColumns = ColumnDef<IUser> & {
  accessorKey?: keyof IUser;
};

export const useUserTableColumns = (): UserTableColumns[] => {
  const { t } = useTranslation("user");
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();

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
      accessorKey: "userName",
      header: t("columns.username"),
      cell: ({ row }) => {
        return (
          <Link
            className="text-primary hover:underline"
            href={RouteConfig.ADMIN.USER.UPDATE(
              row.original.orgCustomId,
              row.original.orgUserId
            )}
          >
            {row.original.userName}
          </Link>
        );
      },
    },
    {
      accessorKey: "tmpUserEmail",
      header: t("columns.email"),
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
      accessorKey: "customRoleName",
      header: t("columns.customRoleName"),
      cell: ({ row }) => {
        return row.original.customRoleName || "-";
      },
    },
    {
      accessorKey: "rolesList",
      header: t("columns.role"),
      cell: ({ row }) => {
        const role = row.original.rolesList;

        if (!role) return "-";

        return (
          <div className="max-w-[300px] w-full flex flex-wrap gap-x-0.5 gap-y-0.5">
            {role.split(",").map((badge, i) => {
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
      accessorKey: "isOrgInitialUser",
      header: t("columns.isOrgInitialUser"),
      cell: ({ row }) => {
        return row.original.isOrgInitialUser === "YES" ? (
          <Check className="size-4 text-green-600" />
        ) : (
          <X className="size-4 text-red-600" />
        );
      },
    },
    {
      accessorKey: "userStatus",
      header: t("columns.userStatus"),
    },
    {
      id: "actions",
      header: t("columns.action"),
      cell: ({ row }) => {
        const userStatus = row.original.userStatus;
        const isActive = userStatus === "Active";
        const isInactive = userStatus === "Disabled";

        const [ConfirmEnableDialog, confirmEnable] = Confirm({
          title: t("enable.title"),
          message: t("enable.message"),
          variant: "default",
        });

        const [ConfirmDisableDialog, confirmDisable] = Confirm({
          title: t("disable.title"),
          message: t("disable.message"),
          variant: "destructive",
        });

        const enabledUser = enabledUserApi.useEnabledUser();
        const disabledUser = disabledUserApi.useDisabledUser();

        const handleEnableUser = async (apiKeyId: string) => {
          const ok = await confirmEnable();
          if (!ok) return;

          const toastId = toast.loading(t("enable.loading"));

          try {
            await enabledUser.mutateAsync(
              {
                orgId: params.orgId,
                userId: apiKeyId,
              },
              {
                onSuccess: ({ data }) => {
                  if (data.status != "OK") {
                    return toast.error(data.description, { id: toastId });
                  }

                  toast.success(t("enable.success"), { id: toastId });

                  // Invalidate query to refetch data
                  queryClient.invalidateQueries({
                    queryKey: fetchUsersApi.key,
                  });
                },
              }
            );
          } catch {
            toast.error(t("enable.error"), { id: toastId });
          }
        };

        const handleDisableApiKey = async (userId: string) => {
          const ok = await confirmDisable();
          if (!ok) return;

          const toastId = toast.loading(t("disable.loading"));

          try {
            await disabledUser.mutateAsync(
              {
                orgId: params.orgId,
                userId: userId,
              },
              {
                onSuccess: ({ data }) => {
                  if (data.status != "OK") {
                    return toast.error(data.description, { id: toastId });
                  }

                  toast.success(t("disable.success"), { id: toastId });

                  // Invalidate query to refetch data
                  queryClient.invalidateQueries({
                    queryKey: fetchUsersApi.key,
                  });
                },
              }
            );
          } catch {
            toast.error(t("disable.error"), { id: toastId });
          }
        };

        return (
          <>
            <ConfirmDisableDialog />
            <ConfirmEnableDialog />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={!isActive}
                  onClick={() => {
                    handleDisableApiKey(row.original.orgUserId);
                  }}
                >
                  {t("actions.disableUser")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!isInactive}
                  onClick={() => {
                    handleEnableUser(row.original.orgUserId);
                  }}
                >
                  {t("actions.enableUser")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
};
