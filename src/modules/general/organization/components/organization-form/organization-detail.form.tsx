"use client";

import { useState, KeyboardEvent } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, XIcon } from "lucide-react";
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
  const { tags } = form.watch();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const tagsArray = tags
    ? tags.split(",").filter((tag) => tag.trim() !== "")
    : [];

  const handleUploadSuccess = (logoUrl: string, logoPath: string) => {
    form.setValue("logoImageUrl", logoUrl, { shouldDirty: true });
    form.setValue("logoImagePath", logoPath, { shouldDirty: true });
  };

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
              <div className="w-full aspect-square bg-muted rounded-lg border flex items-center justify-center text-muted-foreground">
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
        <div>
          <Label>
            {t("detail.tags")} <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2">
            <Input
              isRequired
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("detail.tagsPlaceholder")}
              errorMessage={errorMessageAsLangKey(
                form.formState.errors.tags?.message,
                t
              )}
              maxLength={30}
              disabled={isViewMode || isSubmitting}
            />
          </div>
          {tagsArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tagsArray.map((tag, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                    disabled={isViewMode || isSubmitting}
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
