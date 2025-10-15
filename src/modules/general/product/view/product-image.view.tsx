"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Grip, Plus, Trash2 } from "lucide-react";
import {
  getItemImageByItemIdApi,
  GetImageImageByItemIDResponse,
} from "../api/get-item-images-by-item-id.api";
import { UploadImageModal } from "../components/upload-image-modal";
import { EditImageModal } from "../components/edit-image-modal";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { deleteItemImagesByItemIdApi } from "../api/delete-item-images-by-item-id.api";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";

const ProductImageView = () => {
  const params = useParams<{ orgId: string; productId: string }>();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] =
    useState<GetImageImageByItemIDResponse | null>(null);

  const [DeleteDialog, confirmDelete] = useConfirm({
    title: "ต้องการลบรูปภาพนี้หรือไม่?",
    message: "การลบรูปภาพนี้จะไม่สามารถกู้คืนได้",
    variant: "destructive",
  });

  const deleteItemImagesByItemId = deleteItemImagesByItemIdApi.useMutation();

  const {
    data: imagesData,
    isLoading,
    refetch,
  } = getItemImageByItemIdApi.useQuery({
    orgId: params.orgId,
    itemId: params.productId,
  });

  const images = imagesData?.data || [];

  const handleUploadSuccess = () => {
    refetch();
  };

  const handleEditClick = (image: GetImageImageByItemIDResponse) => {
    setSelectedImage(image);
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    refetch();
  };

  const handleDelete = async (imageId: string) => {
    const confirmed = await confirmDelete();

    if (!confirmed) return;

    deleteItemImagesByItemId.mutate(
      { orgId: params.orgId, itemImageId: imageId },
      {
        onSuccess: () => {
          refetch();
          toast.success("ลบรูปภาพสำเร็จ");
        },
        onError: () => {
          toast.error("ลบรูปภาพไม่สำเร็จ");
        }
      }
    );
  };

  return (
    <div className="mx-auto p-6 space-y-6">
      <DeleteDialog />
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">รูปภาพสินค้า</h2>
          <p className="text-sm text-muted-foreground">จัดการรูปภาพของสินค้า</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          เพิ่มรูปภาพ
        </Button>
      </div>

      {/* Images Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                ยังไม่มีรูปภาพ
              </h3>
              <p className="text-sm text-gray-500">
                เริ่มต้นโดยการเพิ่มรูปภาพสินค้าของคุณ
              </p>
            </div>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรูปภาพแรก
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition-colors"
            >
              <Image
                src={image.imageUrl}
                alt={image.narative || "Product image"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity gap-2 flex items-start justify-center">
                <Button
                  size="icon"
                  variant="destructive"
                  className="gap-2 absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement delete functionality
                    handleDelete(image.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  className="gap-2 absolute top-2 left-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(image);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>

                <Button size="icon" className="mt-2">
                  <Grip className="w-4 h-4" />
                </Button>
              </div>

              {/* Image info */}
              {image.narative && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs line-clamp-2">
                    {image.narative}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadImageModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        orgId={params.orgId}
        productId={params.productId}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Edit Modal */}
      <EditImageModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        orgId={params.orgId}
        image={selectedImage}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default ProductImageView;
