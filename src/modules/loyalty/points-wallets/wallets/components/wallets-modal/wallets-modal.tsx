import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { errorMessageAsLangKey } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { KeyboardEvent, useEffect, useState } from "react";
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

  const tags = form.watch("tags");
  const [tagInput, setTagInput] = useState("");

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
      setTagInput("");
    }
  };

  // Tag handling logic
  const tagsArray = tags
    ? tags.split(",").filter((tag) => tag.trim() !== "")
    : [];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedTag = tagInput.trim();

      if (trimmedTag && !tagsArray.includes(trimmedTag)) {
        const newTags = [...tagsArray, trimmedTag];
        form.setValue("tags", newTags.join(","), {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.trigger("tags");
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tagsArray.filter((tag) => tag !== tagToRemove);
    form.setValue("tags", newTags.join(","), {
      shouldDirty: true,
      shouldValidate: true,
    });
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
            customerId: "", // Assuming not needed or handled by backend if empty
            pointBalance: 0, // Assuming not updating balance here
          },
        },
        {
          onSuccess: async (data) => {
            if (data.data.status !== "SUCCESS") {
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

          <div className="space-y-2">
            <Input
              label={t("form.tags")}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
              disabled={isSubmitting}
              placeholder={t("form.tagsPlaceholder")}
              errorMessage={errorMessageAsLangKey(errors.tags?.message, t)}
            />
            {tagsArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tagsArray.map((tag, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-primary-foreground/20 rounded-full p-0.5 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
