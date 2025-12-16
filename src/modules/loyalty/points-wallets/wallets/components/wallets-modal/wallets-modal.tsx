import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputTags } from "@/components/ui/input-tags";
import { useConfirm } from "@/hooks/use-confirm";
import { errorMessageAsLangKey } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createWalletApi } from "../../api/create-wallets.api";
import { getWalletsApi } from "../../api/get-wallets.api";
import { updateWalletApi } from "../../api/update-wallets.api";
import { walletsSchema, WalletsSchemaType } from "../../schema/wallets.schema";
import { fetchWalletsApi } from "../../api/fetch-wallets.api";

interface WalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletId?: string | null;
}

export const WalletsModal = ({
  isOpen,
  onClose,
  walletId,
}: WalletsModalProps) => {
  const { t } = useTranslation(["wallets", "common"]);
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();

  const createWallet = createWalletApi.useCreateWallet();
  const updateWallet = updateWalletApi.useUpdateWallet();
  const getWallet = getWalletsApi.useGetWallets(
    {
      orgId: params.orgId,
      walletId: walletId ?? "",
    },
    {
      enabled: !!walletId,
    }
  );

  const form = useForm<WalletsSchemaType>({
    resolver: zodResolver(walletsSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: "",
    },
  });
  const errors = form.formState.errors;
  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (isOpen && walletId && getWallet.data?.data) {
      const wallet = getWallet.data.data;
      form.reset({
        name: wallet.wallet.name,
        description: wallet.wallet.description || "",
        tags: wallet.wallet.tags || "",
      });
    } else if (isOpen && !walletId) {
      form.reset({
        name: "",
        description: "",
        tags: "",
      });
    }
  }, [isOpen, walletId, getWallet.data, form]);

  const [ConfirmationDialog, confirm] = useConfirm({
    title: t("common:unsave.title"),
    message: t("common:unsave.message"),
    cancelButton: t("common:common.cancel"),
    confirmButton: t("common:common.ok"),
    variant: "destructive",
  });

  const handleClose = async (open: boolean) => {
    if (!open) {
      if (form.formState.isDirty) {
        const ok = await confirm();
        if (!ok) return;
      }
      onClose();
      form.reset();
    }
  };

  const onSubmit = async (values: WalletsSchemaType) => {
    if (walletId) {
      await updateWallet.mutateAsync(
        {
          orgId: params.orgId,
          walletId: walletId,
          params: {
            id: walletId,
            orgId: params.orgId,
            name: values.name,
            description: values.description || "",
            tags: values.tags || "",
          },
        },
        {
          onSuccess: async (data) => {
            if (data.data.status !== "SUCCESS" && data.data.status !== "OK") {
              return toast.error(data.data.description);
            }

            toast.success(t("update.success", "wallet updated successfully"));

            await queryClient.invalidateQueries({
              queryKey: [fetchWalletsApi.key],
            });
            await queryClient.invalidateQueries({
              queryKey: [getWalletsApi.key, walletId],
            });
            form.reset();
            onClose();
          },
        }
      );
    } else {
      await createWallet.mutateAsync(
        {
          orgId: params.orgId,
          params: {
            orgId: params.orgId,
            name: values.name,
            description: values.description || "",
            tags: values.tags || "",
            customerId: "", // Assuming not needed
            pointBalance: 0,
          },
        },
        {
          onSuccess: async (data) => {
            if (data.data.status !== "OK") {
              return toast.error(data.data.description);
            }
            toast.success(t("create.success", "Wallet created successfully"));

            await queryClient.invalidateQueries({
              queryKey: [fetchWalletsApi.key],
            });

            form.reset();
            onClose();
          },
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <ConfirmationDialog />
      <DialogContent iconWhite>
        <DialogHeader className="bg-primary text-white rounded-t-lg -m-6 mb-4 p-4">
          <DialogTitle className="text-lg font-semibold">
            {walletId ? t("updateTitle") : t("createTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                label={t("form.name")}
                isRequired
                errorMessage={errorMessageAsLangKey(errors.name?.message, t)}
                disabled={isSubmitting}
                maxLength={100}
              />
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <div className="space-y-2">
                <Input
                  {...field}
                  label={t("form.description")}
                  disabled={isSubmitting}
                  className="resize-none"
                  errorMessage={errorMessageAsLangKey(
                    errors.description?.message,
                    t
                  )}
                />
              </div>
            )}
          />

          <Controller
            control={form.control}
            name="tags"
            render={({ field }) => (
              <InputTags
                label={t("form.tags")}
                placeholder={t("form.tagsPlaceholder")}
                maxLength={30}
                disabled={isSubmitting}
                errorMessage={errorMessageAsLangKey(errors.tags?.message, t)}
                value={field.value ?? ""}
                onChange={(value) => {
                  field.onChange(value);
                  form.trigger("tags");
                }}
                onValidate={() => form.trigger("tags")}
              />
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              {t("common:common.cancel")}
            </Button>
            <Button isPending={isSubmitting} type="submit">
              {t("common:common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
