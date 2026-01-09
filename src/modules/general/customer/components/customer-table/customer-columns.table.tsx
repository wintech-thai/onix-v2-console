"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { RouteConfig } from "@/config/route.config";
import { ICustomer } from "../../api/fetch-customer.api";
import { CheckIcon, MoreHorizontalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState as State } from "react";
import { UpdateCustomerEmailModal } from "../../components/modal/update-customer-email.modal";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getWalletByCustomerIdApi } from "@/modules/loyalty/points-wallets/wallets/api/get-wallet-by-customer-id.api";
import { useConfirm as Confirm } from "@/hooks/use-confirm";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCustomerApi } from "../../api/fetch-customer.api";
import { sendCustomerUserCreationEmailApi } from "../../api/send-customer-user-creation-email.api";
import { enableCustomerUserApi } from "../../api/enable-customer-user.api";
import { disableCustomerUserApi } from "../../api/disable-customer-user.api";

type CustomerTableColumns = ColumnDef<ICustomer> & {
  accessorKey?: keyof ICustomer;
};

export const useCustomerTableColumns = (): CustomerTableColumns[] => {
  const { t } = useTranslation("customer");
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();
  const getWalletMutation = getWalletByCustomerIdApi.useGetWalletByCustomerId();

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
            href={RouteConfig.GENERAL.CUSTOMER.UPDATE(
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
      accessorKey: "name",
      header: t("columns.name"),
    },
    {
      accessorKey: "primaryEmail",
      header: t("columns.primaryEmail"),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            {row.original.primaryEmail}{" "}
            {row.original.primaryEmailStatus === "VERIFIED" ? (
              <CheckIcon className="ml-2 size-4 text-green-500" />
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "userStatus",
      header: t("columns.userStatus"),
    },
    {
      accessorKey: "totalPoint",
      header: t("columns.totalPoint"),
      cell: ({ row }) => {
        const total = row.original.totalPoint ?? 0;
        return (
          <div className="text-right w-[65px]">{total.toLocaleString()}</div>
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
      id: "actions",
      header: t("columns.action"),
      cell: ({ row }) => {
        const orgId = row.original.orgId;
        const customerId = row.original.id;
        const [modalOpen, setModalOpen] = State(false);
        const [modalMode, setModalMode] = State<"verify" | "update">("update");
        const isActive =
          row.original.userStatus === "OK" ||
          row.original.userStatus === "TRUE" ||
          row.original.userStatus === "Active";

        const handleOpenModal = (mode: "verify" | "update") => {
          setModalMode(mode);
          setModalOpen(true);
        };

        const [ConfirmSendEmail, confirmSendEmail] = Confirm({
          title: t("sendEmail.title"),
          message: t("sendEmail.message"),
          variant: "default",
        });

        const [ConfirmEnable, confirmEnable] = Confirm({
          title: t("enable.title"),
          message: t("enable.message"),
          variant: "default",
        });

        const [ConfirmDisable, confirmDisable] = Confirm({
          title: t("disable.title"),
          message: t("disable.message"),
          variant: "destructive",
        });

        const sendEmailMutation =
          sendCustomerUserCreationEmailApi.useSendCustomerUserCreationEmail();
        const enableUserMutation =
          enableCustomerUserApi.useEnableCustomerUser();
        const disableUserMutation =
          disableCustomerUserApi.useDisableCustomerUser();

        const handleSendCreationEmail = async () => {
          const ok = await confirmSendEmail();
          if (!ok) return;

          const toastId = toast.loading(
            t("sendEmail.loading", {
              email: row.original.primaryEmail,
            })
          );

          try {
            await sendEmailMutation.mutateAsync(
              { orgId: params.orgId, entityId: customerId },
              {
                onSuccess: ({ data }) => {
                  if (data.status !== "OK") {
                    return toast.error(data.description, { id: toastId });
                  }

                  toast.success(
                    t("sendEmail.success", {
                      email: row.original.primaryEmail,
                    }),
                    { id: toastId }
                  );
                  queryClient.invalidateQueries({
                    queryKey: fetchCustomerApi.key,
                  });
                },
              }
            );
          } catch {
            toast.error(t("sendEmail.error"), { id: toastId });
          }
        };

        const handleEnableUser = async () => {
          const ok = await confirmEnable();
          if (!ok) return;

          const toastId = toast.loading(t("enable.loading"));

          try {
            await enableUserMutation.mutateAsync(
              { orgId: params.orgId, entityId: customerId },
              {
                onSuccess: ({ data }) => {
                  if (data.status !== "OK") {
                    return toast.error(data.description, { id: toastId });
                  }

                  toast.success(t("enable.success"), { id: toastId });
                  queryClient.invalidateQueries({
                    queryKey: fetchCustomerApi.key,
                  });
                },
              }
            );
          } catch {
            toast.error(t("enable.error"), { id: toastId });
          }
        };

        const handleDisableUser = async () => {
          const ok = await confirmDisable();
          if (!ok) return;

          const toastId = toast.loading(t("disable.loading"));

          try {
            await disableUserMutation.mutateAsync(
              { orgId: params.orgId, entityId: customerId },
              {
                onSuccess: ({ data }) => {
                  if (data.status !== "OK") {
                    return toast.error(data.description, { id: toastId });
                  }

                  toast.success(t("disable.success"), { id: toastId });
                  queryClient.invalidateQueries({
                    queryKey: fetchCustomerApi.key,
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
            <ConfirmSendEmail />
            <ConfirmEnable />
            <ConfirmDisable />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={getWalletMutation.isPending}
                  onClick={() => {
                    getWalletMutation.mutate(
                      { orgId, customerId },
                      {
                        onSuccess: ({ data }) => {
                          if (
                            data.status !== "OK" &&
                            data.status !== "SUCCESS"
                          ) {
                            return toast.error(data.description);
                          }

                          if (!data.wallet?.id) {
                            return toast.error("Wallet Id Not Found");
                          }

                          router.push(
                            RouteConfig.LOYALTY.POINTS_WALLETS.POINTS(
                              orgId,
                              data.wallet.id
                            )
                          );
                        },
                      }
                    );
                  }}
                >
                  {t("actions.pointTransaction")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenModal("verify")}>
                  {t("actions.verifyEmail")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenModal("update")}>
                  {t("actions.updateEmail")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSendCreationEmail}>
                  {t("actions.sendCreationEmail")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isActive}
                  onClick={handleEnableUser}
                >
                  {t("actions.enableUser")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!isActive}
                  onClick={handleDisableUser}
                >
                  {t("actions.disableUser")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UpdateCustomerEmailModal
              isOpen={modalOpen}
              setOpen={setModalOpen}
              mode={modalMode}
              orgId={orgId}
              customerId={customerId}
              email={row.original.primaryEmail ?? ""}
            />
          </>
        );
      },
    },
  ];
};
