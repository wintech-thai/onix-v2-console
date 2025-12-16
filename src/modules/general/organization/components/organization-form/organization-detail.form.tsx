"use client";

import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { InputTags } from "@/components/ui/input-tags";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { OrganizationSchemaType } from "../../schema/organization.schema";
import { UploadLogoModal } from "../upload-logo-modal";
import { useParams } from "next/navigation";
import { errorMessageAsLangKey } from "@/lib/utils";

interface OrganizationDetailFormProps {
  isViewMode: boolean;
}

export const OrganizationDetailForm = ({
  isViewMode,
}: OrganizationDetailFormProps) => {
  const { t } = useTranslation("organization");
  const params = useParams<{ orgId: string }>();
  const form = useFormContext<OrganizationSchemaType>();
  const isSubmitting = form.formState.isSubmitting;
  const logoImageUrl = form.watch("logoImageUrl");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Listen for custom event to open upload modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsUploadModalOpen(true);
    };

    window.addEventListener('openUploadLogoModal', handleOpenModal);
    return () => {
      window.removeEventListener('openUploadLogoModal', handleOpenModal);
    };
  }, []);

  const handleUploadSuccess = (logoUrl: string, logoPath: string) => {
    form.setValue("logoImageUrl", logoUrl, { shouldDirty: true });
    form.setValue("logoImagePath", logoPath, { shouldDirty: true });
  };

  return (
    <div className="p-4 md:p-6 border rounded-lg">
      <header className="text-lg font-bold mb-4">{t("detail.title")}</header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Form fields */}
        <div className="flex-1 space-y-4">
          <Input
            label={t("detail.orgCustomId")}
            isRequired
            id="orgCustomId"
            {...form.register("orgCustomId")}
            disabled={true}
            errorMessage={form.formState.errors.orgCustomId?.message}
          />

          <Input
            label={t("detail.orgName")}
            isRequired
            id="orgName"
            {...form.register("orgName")}
            disabled={isViewMode || isSubmitting}
            errorMessage={form.formState.errors.orgName?.message}
            max={30}
          />
          <Input
            label={t("detail.orgDescription")}
            isRequired
            id="orgDescription"
            {...form.register("orgDescription")}
            disabled={isViewMode || isSubmitting}
            errorMessage={form.formState.errors.orgDescription?.message}
            max={200}
          />
        </div>

        {/* Right side - Logo image */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-full max-w-xs">
            {logoImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoImageUrl}
                alt="Organization Logo"
                className="w-full h-[200px] rounded-lg border object-contain"
              />
            ) : (
              <div className="w-full h-[200px] aspect-square bg-muted rounded-lg border flex items-center justify-center text-muted-foreground">
                {t("detail.noLogo")}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsUploadModalOpen(true)}
            disabled={isViewMode || isSubmitting}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {t("logo.upload")}
          </Button>
        </div>
      </div>

      <UploadLogoModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        orgId={params.orgId}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Full width fields */}
      <div className="space-y-4 mt-4">
        <Controller
          control={form.control}
          name="tags"
          render={({ field }) => (
            <InputTags
              label={t("detail.tags")}
              placeholder={t("detail.tagsPlaceholder")}
              errorMessage={errorMessageAsLangKey(
                form.formState.errors.tags?.message,
                t
              )}
              maxLength={30}
              disabled={isViewMode || isSubmitting}
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
    </div>
  );
};
