"use client";

import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { IApiKey } from "../../api/fetch-apikey.api";
import { MoreHorizontalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RouteConfig } from "@/config/route.config";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { enableApiKeyApi } from "../../api/enable-apikey.api";
import { disableApiKeyApi } from "../../api/disable-apikey.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchApiKeyApi } from "../../api/fetch-apikey.api";
import { useConfirm as Confirm } from "@/hooks/use-confirm";

type ApiKeyTableColumns = ColumnDef<IApiKey> & {
  accessorKey?: keyof IApiKey;
};

export const useApiKeyTableColumns = (): ApiKeyTableColumns[] => {
  const { t } = useTranslation("apikey");
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
      accessorKey: "keyName",
      header: t("columns.keyName"),
      cell: ({ row }) => {
        return (
          <Link
            className="text-primary hover:underline block"
            href={RouteConfig.ADMIN.APIKEY.UPDATE(
              row.original.orgId,
              row.original.keyId
            )}
          >
            {row.original.keyName || "-"}
          </Link>
        );
      },
    },
    {
      accessorKey: "keyDescription",
      header: t("columns.keyDescription"),
      cell: ({ row }) => {
        return row.original.keyDescription || "-";
      },
    },
    {
      accessorKey: "rolesList",
      header: t("columns.rolesList"),
      cell: ({ row }) => {
        const role = row.original.rolesList;

        if (!role) return "-";

        return (
          <div className="max-w-[300px] w-full flex flex-wrap gap-x-0.5 gap-y-0.5">
            {role.split(",").map((badge, i) => {
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
      accessorKey: "keyStatus",
      header: t("columns.status"),
    },
    {
      id: "actions",
      header: t("columns.action"),
      cell: ({ row }) => {
        const keyStatus = row.original.keyStatus;
        const isActive = keyStatus === "Active";
        const isInactive = keyStatus === "Disabled";

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

        const enableApiKey = enableApiKeyApi.useEnableApiKey();
        const disableApiKey = disableApiKeyApi.useDisableApiKey();

        const handleEnableApiKey = async (apiKeyId: string) => {
          const ok = await confirmEnable();
          if (!ok) return;

          const toastId = toast.loading(t("enable.loading"));

          try {
            await enableApiKey.mutateAsync(
              {
                orgId: params.orgId,
                apiKeyId: apiKeyId,
              },
              {
                onSuccess: ({ data }) => {
                  if (data.status != "OK") {
                    return toast.error(data.description, { id: toastId });
                  }

                  toast.success(t("enable.success"), { id: toastId });

                  // Invalidate query to refetch data
                  queryClient.invalidateQueries({
                    queryKey: fetchApiKeyApi.key,
                  });
                },
                onError: () => {
                  toast.error(t("enable.error"), { id: toastId });
                },
              }
            );
          } catch {
            toast.error(t("enable.error"), { id: toastId });
          }
        };

        const handleDisableApiKey = async (apiKeyId: string) => {
          const ok = await confirmDisable();
          if (!ok) return;

          const toastId = toast.loading(t("disable.loading"));

          try {
            await disableApiKey.mutateAsync(
              {
                orgId: params.orgId,
                apiKeyId: apiKeyId,
              },
              {
                onSuccess: ({ data }) => {
                  if (data.status != "OK") {
                    return toast.error(data.description, { id: toastId });
                  }

                  toast.success(t("disable.success"), { id: toastId });

                  // Invalidate query to refetch data
                  queryClient.invalidateQueries({
                    queryKey: fetchApiKeyApi.key,
                  });
                },
                onError: () => {
                  toast.error(t("disable.error"), { id: toastId });
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
                  onSelect={() => {
                    handleDisableApiKey(row.original.keyId);
                  }}
                >
                  {t("actions.disableApiKey")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!isInactive}
                  onSelect={() => {
                    handleEnableApiKey(row.original.keyId);
                  }}
                >
                  {t("actions.enableApiKey")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
};
