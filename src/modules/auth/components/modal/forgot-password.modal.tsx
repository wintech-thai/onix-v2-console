import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import z from "zod";
import { forgotPasswordSchema } from "../../schema/forget-password.schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { errorMessageAsLangKey } from "@/lib/utils";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordModal = ({
  open,
  onClose,
}: ForgotPasswordModalProps) => {
  const { t } = useTranslation(["auth", "common"]);
  const form = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const errors = form.formState.errors;
  const isSubmitting = form.formState.isSubmitting;

  const forgotPasswordMutate = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: (email: string) => {
      return authApi.forgotPassword(email);
    },
    onSuccess: ({ data }) => {
      if (data.status !== "OK") {
        return toast.error(data.description)
      }
      toast.success(t("auth:forgotPassword.success"));
      handleOpenChange(false);
    },
    onError: () => {
      toast.error(t("auth:forgotPassword.error"));
    },
  });

  const handleSubmit = async (formData: ForgotPasswordFormType) => {
    try {
      await forgotPasswordMutate.mutateAsync(formData.email);
    } catch (error) {
      // Error is already handled in onError
      console.error(error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      form.reset();
      form.clearErrors();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("auth:forgotPassword.title")}</DialogTitle>
          <DialogDescription>
            {t("auth:forgotPassword.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => (
              <Input
                {...field}
                label={t("auth:forgotPassword.emailLabel")}
                type="email"
                placeholder={t("auth:forgotPassword.emailPlaceholder")}
                errorMessage={errorMessageAsLangKey(
                  errors.email?.message,
                  t
                )}
                maxLength={80}
                disabled={isSubmitting}
              />
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common:common.cancel")}
            </Button>
            <Button isPending={isSubmitting}>
              {t("auth:forgotPassword.sendButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
