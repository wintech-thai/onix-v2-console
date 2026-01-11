"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputTags } from "@/components/ui/input-tags";
import { ArrowLeftIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import {
  rolePermissionsSchema,
  RolePermissionsSchemaType,
} from "../../schema/role-permissions.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFormNavigationBlocker } from "@/hooks/use-form-navigation-blocker";
import { useConfirm } from "@/hooks/use-confirm";
import { useTranslation } from "react-i18next";
import { errorMessageAsLangKey } from "@/lib/utils";
import { PermissionsTree } from "./permissions-tree";

interface RolePermissionsFormProps {
  onSubmit: (values: RolePermissionsSchemaType) => Promise<void>;
  initialValue: RolePermissionsSchemaType;
  isUpdate: boolean;
}

export const RolePermissionsForm = ({
  onSubmit,
  initialValue,
  isUpdate,
}: RolePermissionsFormProps) => {
  const router = useRouter();
  const { t } = useTranslation("role-permissions");
  const { setFormDirty } = useFormNavigationBlocker();
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<RolePermissionsSchemaType>({
    resolver: zodResolver(rolePermissionsSchema),
    defaultValues: initialValue,
  });

  const [ConfirmBack, confirmBack] = useConfirm({
    message: t("form.unsavedChanges"),
    title: t("form.leavePage"),
    variant: "destructive",
  });

  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;
  const errors = form.formState.errors;

  // Sync form dirty state with navigation blocker
  useEffect(() => {
    setFormDirty(isDirty);
  }, [isDirty, setFormDirty]);

  const handleCancel = async () => {
    if (!isDirty) {
      setFormDirty(false);
      return router.back();
    }

    const ok = await confirmBack();

    if (ok) {
      form.reset();
      form.clearErrors();
      setFormDirty(false);
      router.back();
    }
  };

  const handleSubmit = async (values: RolePermissionsSchemaType) => {
    if (!isDirty) {
      return router.back();
    }

    await onSubmit(values);

    setFormDirty(false);
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="h-full flex flex-col"
    >
      <ConfirmBack />

      <header className="p-4 border border-b">
        <h1 className="text-lg font-bold">
          <ArrowLeftIcon
            onClick={handleCancel}
            className="inline cursor-pointer"
          />{" "}
          {isUpdate ? t("form.updateTitle") : t("form.createTitle")}
        </h1>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Role Information Section */}
        <div className="p-4 md:p-6 border rounded-lg">
          <header className="text-lg font-bold">
            {t("form.roleInformation")}
          </header>
          <div className="grid md:grid-cols-2 mt-4 gap-4 mb-4">
            <Controller
              control={form.control}
              name="roleName"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.roleName")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.roleName?.message,
                      t
                    )}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                );
              }}
            />
            <Controller
              control={form.control}
              name="roleDescription"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label={t("form.roleDescription")}
                    isRequired
                    errorMessage={errorMessageAsLangKey(
                      errors.roleDescription?.message,
                      t
                    )}
                    disabled={isSubmitting}
                    maxLength={200}
                  />
                );
              }}
            />
          </div>

          <Controller
            control={form.control}
            name="tags"
            render={({ field }) => (
              <InputTags
                label={t("form.tags")}
                errorMessage={errorMessageAsLangKey(errors.tags?.message, t)}
                maxLength={30}
                disabled={isSubmitting}
                isRequired
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  form.trigger("tags");
                }}
                onValidate={() => form.trigger("tags")}
              />
            )}
          />
        </div>

        {/* Permissions Section */}
        <div className="p-4 md:p-6 border rounded-lg relative">
          <header className="text-lg font-bold mb-4">
            {t("form.permissions")}
          </header>

          {/* Search Box */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder={t("form.searchPermissions")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Permissions Tree */}
          <Controller
            control={form.control}
            name="permissions"
            render={({ field }) => (
              <PermissionsTree
                permissions={field.value}
                onChange={field.onChange}
                searchQuery={searchQuery}
                disabled={isSubmitting}
              />
            )}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="p-4 border-t flex justify-end gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={isSubmitting}
          onClick={handleCancel}
        >
          {t("form.cancel")}
        </Button>
        <Button type="submit" isPending={isSubmitting} disabled={isSubmitting}>
          {t("form.save")}
        </Button>
      </footer>
    </form>
  );
};
