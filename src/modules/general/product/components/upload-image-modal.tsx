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
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { getItemImageUploadPresignedUrlApi } from "../api/get-item-image-upload-presigned-url.api";
import { addItemImageApi } from "../api/add-item-image.api";

interface UploadImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  productId: string;
  onUploadSuccess?: () => void;
}

export const UploadImageModal = ({
  open,
  onOpenChange,
  orgId,
  productId,
  onUploadSuccess,
}: UploadImageModalProps) => {
  const getItemImageUploadPresignedUrl =
    getItemImageUploadPresignedUrlApi.useMutation();
  const addImageItem = addItemImageApi.useMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ใช้ react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/png": [".png"],
    },
    maxSize: 1024 * 1024, // 1MB
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
          toast.error("ไฟล์มีขนาดใหญ่เกิน 1MB");
        } else if (
          rejection.errors.some((e) => e.code === "file-invalid-type")
        ) {
          toast.error("กรุณาเลือกไฟล์ PNG เท่านั้น");
        } else {
          toast.error("ไฟล์ไม่ถูกต้อง");
        }
      });
    },
  });

  const handleUpload = async () => {
    if (!selectedFile || !orgId || !productId) {
      toast.error("กรุณาเลือกรูปภาพก่อนอัปโหลด");
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: ขอ presigned URL
      const response = await getItemImageUploadPresignedUrl.mutateAsync({
        orgId: orgId,
        productId: productId,
      });

      if (response.data.status !== "SUCCESS") {
        throw new Error("ไม่สามารถขอ URL สำหรับอัปโหลดได้");
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
        throw new Error("การอัปโหลดไฟล์ล้มเหลว");
      }

      // Step 3: บันทึกข้อมูลรูปภาพในระบบ
      const imagePath = response.data.imagePath; // ได้ path ของรูปภาพจาก presigned URL
      const imageUrl = response.data.previewUrl;

      const result = await addImageItem.mutateAsync({
        orgId: orgId,
        itemId: productId,
        imagePath: imagePath,
        imageUrl: imageUrl,
        narative: "",
        tags: "",
        category: 1,
      });

      if (result.status !== 200) {
        throw new Error("การบันทึกรูปภาพล้มเหลว");
      }

      toast.success("อัปโหลดรูปภาพสำเร็จ!");

      // Reset form
      handleReset();

      // Close modal
      onOpenChange(false);

      // Callback to refresh images list
      onUploadSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
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

  // Reset when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleReset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>อัปโหลดรูปภาพสินค้า</DialogTitle>
          <DialogDescription>
            เลือกหรือลากรูปภาพมาวางเพื่ออัปโหลด
          </DialogDescription>
        </DialogHeader>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg transition-colors cursor-pointer
            ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300"}
            ${previewUrl ? "p-4" : "p-12"}
          `}
        >
          <input {...getInputProps()} />
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={isUploading}
                  className="gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังอัปโหลด...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      อัปโหลด
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive
                    ? "วางรูปภาพที่นี่..."
                    : "ลากและวางรูปภาพที่นี่"}
                </p>
                <p className="text-sm text-gray-500">
                  หรือคลิกเพื่อเลือกรูปภาพ
                </p>
                <p className="text-xs text-gray-400">
                  รองรับเฉพาะไฟล์ PNG ขนาดไม่เกิน 1MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ข้อกำหนดไฟล์
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>รองรับเฉพาะไฟล์ PNG (.png)</li>
            <li>ขนาดไฟล์สูงสุด 1 MB</li>
            <li>รูปภาพจะถูกจัดเก็บอย่างปลอดภัยบน Google Cloud Storage</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
