"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useDropzone } from "react-dropzone";
import { getLogoImageUploadPresignedUrlApi } from "../api/get-logo-image-upload-presigned-url.api";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { getOrganizationApi } from "../api/get-organization.api";

interface UploadLogoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  onUploadSuccess?: (logoUrl: string, logoPath: string) => void;
}

export const UploadLogoModal = ({
  open,
  onOpenChange,
  orgId,
  onUploadSuccess,
}: UploadLogoModalProps) => {
  const { t } = useTranslation(["organization", "common"]);
  const queryClient = useQueryClient();
  const getLogoImageUploadPresignedUrl =
    getLogoImageUploadPresignedUrlApi.useGetLogoImageUploadPresignedUrl({ orgId });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ใช้ react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 1,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setSelectedFile(file);
      }
    },
    onDropRejected: (rejections) => {
      rejections.forEach((rejection) => {
        if (rejection.errors.some((e) => e.code === "file-too-large")) {
          toast.error(t("logo.maxSize"));
        } else if (
          rejection.errors.some((e) => e.code === "file-invalid-type")
        ) {
          toast.error(t("logo.onlyJPG"));
        } else {
          toast.error(t("logo.uploadError"));
        }
      });
    },
  });

  const handleUpload = async () => {
    if (!selectedFile || !orgId) {
      toast.error(t("logo.uploadError"));
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: ขอ presigned URL
      const response = await getLogoImageUploadPresignedUrl.mutateAsync();

      if (response.data.status !== "SUCCESS") {
        throw new Error(t("logo.uploadError"));
      }

      // Step 2: อัปโหลดไฟล์ไปยัง GCS ผ่าน presigned URL
      const uploadResponse = await axios.put(
        response.data.presignedUrl.trim(),
        selectedFile,
        {
          headers: {
            "Content-Type": selectedFile.type,
            "x-goog-meta-onix-is-temp-file": "true",
          },
        }
      );

      if (uploadResponse.status !== 200) {
        throw new Error(t("logo.uploadError"));
      }

      // Step 3: ส่งค่า logoUrl และ logoPath กลับไป
      const logoPath = response.data.imagePath;
      const logoUrl = response.data.previewUrl;

      toast.success(t("logo.uploadSuccess"));

      // Reset form
      handleReset();

      // Close modal
      onOpenChange(false);

      await queryClient.invalidateQueries({
        queryKey: [getOrganizationApi.key],
        refetchType: "active"
      });

      // Callback with logo info
      onUploadSuccess?.(logoUrl, logoPath);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          return toast.error(
            t("common:error.noPermissions", {
              apiName: "GetLogoImageUploadPresignedUrl",
            })
          );
        }
      }
      console.error("Upload error:", error);
      if (error instanceof Error) {
        return toast.error(error.message);
      }
      toast.error(t("logo.uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleReset = () => {
    handleRemoveImage();
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent iconWhite className="sm:max-w-md">
        <DialogHeader className="bg-primary text-white rounded-t-lg -m-6 mb-4 p-4">
          <DialogTitle>{t("logo.uploadTitle")}</DialogTitle>
          <DialogDescription className="text-white">
            {t("logo.uploadDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg transition-colors cursor-pointer
            ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300"}
            ${previewUrl ? "p-4" : "p-8"}
          `}
        >
          <input {...getInputProps()} />
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Logo Preview"
                  className="w-full h-auto max-h-64 object-contain rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{selectedFile?.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedFile && (selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-medium">
                  {isDragActive ? t("logo.dragHere") : t("logo.dragHere")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("logo.clickToSelect")}
                </p>
                <p className="text-xs text-gray-400">
                  {t("logo.onlyJPG")} • {t("logo.maxSize")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            {t("logo.fileRequirements")}
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>{t("logo.onlyJPG")}</li>
            <li>{t("logo.maxSize")}</li>
            <li>{t("logo.recommendedSize")}</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("logo.uploading")}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {t("logo.upload")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
