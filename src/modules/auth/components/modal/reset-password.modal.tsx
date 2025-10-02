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
import { resetPasswordSchema } from "../../schema/forget-password.schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { errorMessageAsLangKey } from "@/lib/utils";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

type ResetPasswordFormType = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordModal = ({
  open,
  onClose,
}: ResetPasswordModalProps) => {
  const { t } = useTranslation();
  const params = useParams<{ orgId: string }>();
  const [updatePasswordError, setUpdatePasswordError] = useState(false);
  const form = useForm<ResetPasswordFormType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  const errors = form.formState.errors;
  const isSubmitting = form.formState.isSubmitting;

  const updatePasswordMutate = useMutation({
    mutationKey: [authApi.updatePassword.keys],
    mutationFn: ({
      orgId,
      data,
    }: {
      orgId: string;
      data: ResetPasswordFormType;
    }) => {
      return authApi.updatePassword.api({
        orgId,
        data: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }
      });
    },
    onSuccess: async () => {
      await authApi.logout.clearAccessToken();
    }
  });

  const handleSubmit = async (formData: ResetPasswordFormType) => {
    try {
      setUpdatePasswordError(false);
      const r = await updatePasswordMutate.mutateAsync({
        orgId: params.orgId,
        data: formData,
      });

      if (r.data.status === "ERROR_VALIDATION_PASSWORD") {
        setUpdatePasswordError(true);
        return;
      }

      if (r.data.status === "IDP_UPDATE_PASSWORD_ERROR") {
        toast.error(t("auth.validPassword.IDP_UPDATE_PASSWORD_ERROR"));
        return;
      }

      toast.success("Password updated successfully");
    } catch {
      toast.error("Failed to update password");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setUpdatePasswordError(false);
      form.reset();
      form.clearErrors();
    }
  };

  const errorsPassword = [
    t("auth.validPassword.1"),
    t("auth.validPassword.2"),
    t("auth.validPassword.3"),
    t("auth.validPassword.4"),
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("auth.updatePasswordHeader")}</DialogTitle>
          <DialogDescription>{t("auth.updatePasswordesc")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <Controller
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <Input
                {...field}
                label={t("auth.currentPassword")}
                type="password"
                placeholder={t("auth.currentPassword")}
                errorMessage={errorMessageAsLangKey(errors.currentPassword?.message, t)}
                maxLength={20}
              />
            )}
          />
          <Controller
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <Input
                {...field}
                label={t("auth.newPassword")}
                type="password"
                placeholder={t("auth.newPassword")}
                errorMessage={errorMessageAsLangKey(errors.newPassword?.message, t)}
                maxLength={20}
              />
            )}
          />
          <Controller
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <Input
                {...field}
                label={t("auth.confirmNewPassword")}
                type="password"
                placeholder={t("auth.confirmNewPassword")}
                errorMessage={errorMessageAsLangKey(errors.confirmNewPassword?.message, t)}
                maxLength={20}
              />
            )}
          />

          <div>
            {updatePasswordError
              ? errorsPassword.map((err, idex) => {
                  return (
                    <div key={idex} className="pl-4 text-sm text-destructive flex items-center gap-x-2">
                      <div className="size-1 rounded-full bg-destructive" />{err}
                    </div>
                  );
                })
              : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button isPending={isSubmitting}>{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
