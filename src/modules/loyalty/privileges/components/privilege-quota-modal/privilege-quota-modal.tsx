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
import { useParams } from "next/navigation";
import { KeyboardEvent, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { addPrivilegeQuantityApi } from "../../api/add-privilege-quantity.api";
import { deDuctPrivilegeQuantityApi } from "../../api/deduct-privilege-quantity.api";
import { fetchPrivilegesApi } from "../../api/fetch-privileges.api";
import { z } from "zod";
import { getPrivilegesApi } from "../../api/get-privileges.api";

const privilegeQuotaSchema = z.object({
  amount: z.number().min(1, "quota.errors.amountRequired"),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type PrivilegeQuotaSchemaType = z.infer<typeof privilegeQuotaSchema>;

interface PrivilegeQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  privilegeId: string | null;
  mode: "add" | "deduct";
  privilegeCode: string;
  currentBalance: number;
}

export const PrivilegeQuotaModal = ({
  isOpen,
  onClose,
  privilegeId,
  mode,
  privilegeCode,
  currentBalance,
}: PrivilegeQuotaModalProps) => {
  const { t } = useTranslation(["privileges", "common"]);
  const params = useParams<{ orgId: string }>();
  const queryClient = useQueryClient();

  const addQuantity = addPrivilegeQuantityApi.useAddPrivilegeQuantity();
  const deductQuantity = deDuctPrivilegeQuantityApi.useDeductPrivilegeQuantity();

  const form = useForm<PrivilegeQuotaSchemaType>({
    resolver: zodResolver(privilegeQuotaSchema),
    defaultValues: {
      amount: 0,
      description: "",
      tags: "",
    },
  });
  const errors = form.formState.errors;
  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;
  const { tags } = form.watch();
  const [tagInput, setTagInput] = useState("");

  // Handle tags
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

  const [ConfirmationDialog, confirm] = useConfirm({
    title: t("common:unsave.title"),
    message: t("common:unsave.message"),
    cancelButton: t("common:common.cancel"),
    confirmButton: t("common:common.ok"),
    variant: "destructive",
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        amount: 0,
        description: "",
        tags: "",
      });
      setTagInput("");
    }
  }, [isOpen, form]);

  const handleClose = async (open: boolean) => {
    if (!open) {
      if (isDirty) {
        const ok = await confirm();
        if (!ok) return;
      }
      onClose();
      form.reset();
    }
  };

  const onSubmit = async (values: PrivilegeQuotaSchemaType) => {
    if (!privilegeId) return;

    if (mode === "deduct" && values.amount > currentBalance) {
      form.setError("amount", {
        type: "manual",
        message: t("quota.errors.insufficientBalance", "Insufficient balance"),
      });
      return;
    }

    const newBalance =
      mode === "add"
        ? currentBalance + values.amount
        : currentBalance - values.amount;

    const bodyParams = {
      description: values.description || "",
      tags: values.tags || "",
      txAmount: values.amount,
      txType: mode === "add" ? 1 : 2,
      currentBalance: newBalance,
      previousBalance: currentBalance,
    };

    const onSuccess = async (data: { status: string; descript: string }) => {
      if (data.status !== "OK" && data.status !== "SUCCESS") {
        toast.error(data.descript);
        return;
      }

      toast.success(
        mode === "add"
          ? t("quota.addSuccess", "Quota added successfully")
          : t("quota.deductSuccess", "Quota deducted successfully")
      );

      await queryClient.invalidateQueries({ queryKey: fetchPrivilegesApi.key });
      await queryClient.invalidateQueries({ queryKey: [getPrivilegesApi.key] });
      form.reset();
      onClose();
    };

    const onError = () => {
      // Error handling is done via useErrorToast in the hook
    };

    if (mode === "add") {
      await addQuantity.mutateAsync(
        {
          orgId: params.orgId,
          privilegeId: privilegeId,
          body: bodyParams,
        },
        { onSuccess: ({ data }) => onSuccess(data), onError }
      );
    } else {
      await deductQuantity.mutateAsync(
        {
          orgId: params.orgId,
          privilegeId: privilegeId,
          body: bodyParams,
        },
        { onSuccess: ({ data }) => onSuccess(data), onError }
      );
    }
  };

  const amount = form.watch("amount");
  const newBalance =
    mode === "add"
      ? currentBalance + (amount || 0)
      : currentBalance - (amount || 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <ConfirmationDialog />
      <DialogContent iconWhite>
        <DialogHeader className="bg-primary text-white rounded-t-lg -m-6 mb-4 p-4">
          <DialogTitle className="text-lg font-semibold">
            {mode === "add" ? t("quota.addTitle") : t("quota.deductTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("quota.privilege")}</label>
            <Input value={privilegeCode} disabled />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("quota.balance")}</label>
            <Input value={currentBalance.toLocaleString()} disabled />
          </div>

          <Controller
            control={form.control}
            name="amount"
            render={({ field }) => (
              <Input
                {...field}
                value={
                  isNaN(field.value) || field.value === 0 ? "" : field.value
                }
                type="number"
                label={t("quota.amount")}
                isRequired
                errorMessage={errorMessageAsLangKey(errors.amount?.message, t)}
                disabled={isSubmitting}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("quota.newBalance", "New Balance")}
            </label>
            <Input value={newBalance.toLocaleString()} disabled />
          </div>

          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <Input
                {...field}
                label={t("quota.description", "Description")}
                disabled={isSubmitting}
              />
            )}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("quota.tags", "Tags")}</label>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("quota.tagsPlaceholder", "Press Enter to add tag")}
              disabled={isSubmitting}
            />
            {tagsArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tagsArray.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-primary text-white rounded-lg px-3 py-1 text-sm flex items-center gap-2"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                      disabled={isSubmitting}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
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
