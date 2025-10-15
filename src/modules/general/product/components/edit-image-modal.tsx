"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productImageSchema,
  ProductImageSchemaType,
} from "../schema/product-image.schema";
import { updateItemImageByItemImageIdApi } from "../api/update-item-image-by-item-image-id.api";
import { GetImageImageByItemIDResponse } from "../api/get-item-images-by-item-id.api";
import Image from "next/image";
import { useConfirm } from "@/hooks/use-confirm";

interface EditImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  image: GetImageImageByItemIDResponse | null;
  onUpdateSuccess?: () => void;
}

export const EditImageModal = ({
  open,
  onOpenChange,
  orgId,
  image,
  onUpdateSuccess,
}: EditImageModalProps) => {
  const updateItemImage = updateItemImageByItemImageIdApi.useMutation();

  const [LeaveDialog, leaveConfirm] = useConfirm({
    title: "ต้องการออกจากหน้านี้หรือไม่?",
    message: "ข้อมูลที่ยังไม่ได้บันทึกจะหายไป",
    variant: "destructive",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setValue,
  } = useForm<ProductImageSchemaType>({
    resolver: zodResolver(productImageSchema),
    defaultValues: {
      image: "",
      narative: "",
      tags: "",
      category: "",
    },
  });

  // Load image data when modal opens
  useEffect(() => {
    if (image && open) {
      reset({
        image: image.imagePath,
        narative: image.narative || "",
        tags: image.tags || "",
        category: image.category?.toString() || "",
      });

      // Parse tags from comma-separated string
      const parsedTags = image.tags
        ? image.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      setTags(parsedTags);
      setTagInput("");
    }
  }, [image, open, reset]);

  // Handle tag input changes
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check if user typed comma
    if (value.includes(",")) {
      const newTags = value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (newTags.length > 0) {
        const updatedTags = [...tags, ...newTags];
        setTags(updatedTags);
        setValue("tags", updatedTags.join(", "), {
          shouldDirty: true,
          shouldValidate: true,
        });
        setTagInput("");
      }
    } else {
      setTagInput(value);
    }
  };

  // Handle tag input key press (Enter)
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedTag = tagInput.trim();
      if (trimmedTag) {
        const updatedTags = [...tags, trimmedTag];
        setTags(updatedTags);
        setValue("tags", updatedTags.join(", "));
        setTagInput("");
      }
    }
  };

  // Remove tag
  const handleRemoveTag = (indexToRemove: number) => {
    const updatedTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(updatedTags);
    setValue("tags", updatedTags.join(", "), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: ProductImageSchemaType) => {
    if (!image) return;

    try {
      await updateItemImage.mutateAsync({
        value: data,
        orgId,
        itemImageId: image.id,
      });

      toast.success("อัปเดตรูปภาพสำเร็จ!");
      onOpenChange(false);
      onUpdateSuccess?.();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตรูปภาพ");
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (isDirty) {
      const confirm = await leaveConfirm();

      if (!confirm) return;

      if (!open && !isSubmitting) {
        reset();
        setTags([]);
        setTagInput("");
        onOpenChange(open);
      }
    }
    if (!open && !isSubmitting) {
      reset();
      setTags([]);
      setTagInput("");
    }
    onOpenChange(open);
  };

  if (!image) return null;

  return (
    <>
      <LeaveDialog />
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลรูปภาพ</DialogTitle>
            <DialogDescription>
              แก้ไขรายละเอียดของรูปภาพสินค้า
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Preview */}
            <div className="space-y-2">
              <Label>รูปภาพ</Label>
              <div className="relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={image.imageUrl}
                  alt={image.narative || "Product image"}
                  fill
                  className="object-contain bg-gray-50"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Image Path (Hidden field) */}
            <input type="hidden" {...register("image")} />

            {/* Narrative */}
            <Input
              label="คำอธิบาย"
              id="narative"
              placeholder="ใส่คำอธิบายรูปภาพ"
              {...register("narative")}
              errorMessage={errors.narative?.message}
            />
            {errors.narative && (
              <p className="text-sm text-red-500">{errors.narative.message}</p>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">
                Tags <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tags-input"
                type="text"
                placeholder="พิมพ์ tag แล้วกด Enter หรือใส่เครื่องหมาย ,"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                className={errors.tags ? "border-red-500" : ""}
              />
              {/* Hidden field for form validation */}
              <input type="hidden" {...register("tags")} />

              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 text-primary rounded-full border border-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {errors.tags && (
                <p className="text-sm text-red-500">{errors.tags.message}</p>
              )}
            </div>

            {/* Category */}
            <Input
              type="number"
              label="Category"
              placeholder="ใส่หมวดหมู่"
              {...register("category")}
              errorMessage={errors.category?.message}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  "บันทึก"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
