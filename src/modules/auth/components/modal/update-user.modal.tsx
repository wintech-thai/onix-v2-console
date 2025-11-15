"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import Cookie from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { getCurrentUserApi } from "../../api/get-current-user.api";
import { updateCurrentUserApi } from "../../api/update-current-user.api";
import {
  currentUserSchema,
  CurrentUserSchemaType,
} from "../../schema/current-user.schema";
import { errorMessageAsLangKey } from "@/lib/utils";

interface UpdateUserModalProps {
  open: boolean;
  onClose: () => void;
}

export const UpdateUserModal = ({ open, onClose }: UpdateUserModalProps) => {
  const { t } = useTranslation("auth");
  const params = useParams<{ orgId: string }>();
  const userName = Cookie.get("user_name") || "";

  const getCurrentUser = getCurrentUserApi.useGetCurrentUser(
    {
      orgId: params.orgId,
      userName,
    },
    open
  );

  const userData = getCurrentUser.data?.user;

  const updateMutation = updateCurrentUserApi.useUpdateCurrentUser();

  const form = useForm<CurrentUserSchemaType>({
    resolver: zodResolver(currentUserSchema),
    defaultValues: {
      name: "",
      lastName: "",
      phoneNumber: "",
      secondaryEmail: "",
    },
  });

  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;
  const errors = form.formState.errors;

  const [ConfirmClose, confirmClose] = useConfirm({
    message: t("form.unsavedChanges"),
    title: t("form.leavePage"),
    variant: "destructive",
  });

  useEffect(() => {
    if (userData) {
      // Remove + prefix if exists
      const phoneWithoutPlus = userData.phoneNumber?.startsWith("+")
        ? userData.phoneNumber.substring(1)
        : userData.phoneNumber;

      form.reset({
        name: userData.name || "",
        lastName: userData.lastName || "",
        phoneNumber: phoneWithoutPlus || "",
        secondaryEmail: userData.secondaryEmail || "",
      });
    }
  }, [userData, form]);

  const handleClose = async () => {
    if (!isDirty) {
      onClose();
      return;
    }

    const ok = await confirmClose();
    if (ok) {
      form.reset();
      onClose();
    }
  };

  const handleSubmit = async (values: CurrentUserSchemaType) => {
    if (!isDirty) {
      onClose();
      return;
    }

    try {
      await updateMutation.mutateAsync({
        orgId: params.orgId,
        userName,
        values,
      });

      toast.success(t("profile.updateSuccess"));
      form.reset(values);
      onClose();
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <>
      <ConfirmClose />
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-full md:min-w-[700px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{t("profile.updateTitle")}</DialogTitle>
            </div>
          </DialogHeader>

          {getCurrentUser.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
            </div>
          ) : getCurrentUser.isError || getCurrentUser.data?.status !== "SUCCESS" ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-destructive text-center">
                {getCurrentUser.data?.description || t("common.error")}
              </p>
              <Button onClick={onClose} variant="destructive">
                {t("form.actions.cancel")}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label={t("profile.userName")}
                  value={userData?.userName || ""}
                  disabled
                  className="col-span-2"
                />

                <Input
                  label={t("profile.userEmail")}
                  value={userData?.userEmail || ""}
                  disabled
                  className="col-span-2"
                />

                <Controller
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={t("profile.name")}
                      isRequired
                      errorMessage={errorMessageAsLangKey(
                        errors.name?.message,
                        t
                      )}
                      disabled={isSubmitting}
                      maxLength={100}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={t("profile.lastName")}
                      isRequired
                      errorMessage={errorMessageAsLangKey(
                        errors.lastName?.message,
                        t
                      )}
                      disabled={isSubmitting}
                      maxLength={100}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={t("profile.phoneNumber")}
                      isRequired
                      placeholder="66812345678"
                      errorMessage={errorMessageAsLangKey(
                        errors.phoneNumber?.message,
                        t
                      )}
                      disabled={isSubmitting}
                      maxLength={15}
                      className="col-span-2"
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="secondaryEmail"
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={t("profile.secondaryEmail")}
                      type="email"
                      placeholder="example@email.com"
                      errorMessage={errorMessageAsLangKey(
                        errors.secondaryEmail?.message,
                        t
                      )}
                      disabled={isSubmitting}
                      maxLength={100}
                      className="col-span-2"
                    />
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {t("form.actions.cancel")}
                </Button>
                <Button type="submit" isPending={isSubmitting}>
                  {t("form.actions.save")}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
