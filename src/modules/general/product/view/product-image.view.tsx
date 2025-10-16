"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Edit, Grip, Plus, Trash2 } from "lucide-react";
import {
  getItemImageByItemIdApi,
  GetImageImageByItemIDResponse,
} from "../api/get-item-images-by-item-id.api";
import { UploadImageModal } from "../components/upload-image-modal";
import { EditImageModal } from "../components/edit-image-modal";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { deleteItemImagesByItemIdApi } from "../api/delete-item-images-by-item-id.api";
import { updateItemImageSortingOrderApi } from "../api/update-item-images-sorting-order.api";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Image Item Component
interface SortableImageItemProps {
  image: GetImageImageByItemIDResponse;
  onEdit: (image: GetImageImageByItemIDResponse) => void;
  onDelete: (imageId: string) => void;
}

const SortableImageItem = ({ image, onEdit, onDelete }: SortableImageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);

  useEffect(() => {
    // Load image to get dimensions
    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.src = image.imageUrl;

    // Fetch image to get file size
    fetch(image.imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const sizeInKB = (blob.size / 1024).toFixed(0);
        setFileSize(`${sizeInKB} KB`);
      })
      .catch(() => {
        setFileSize(null);
      });
  }, [image.imageUrl]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition-colors"
    >
      {/* Drag handle - covers entire image */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
        {...attributes}
        {...listeners}
      />

      <Image
        src={image.imageUrl}
        alt={image.narative || "Product image"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Overlay on hover - ปุ่มอยู่ layer บนสุด */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity gap-2 flex items-center justify-center z-20 pointer-events-none">
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(image.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          className="absolute top-2 left-2 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(image);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          <Grip className="w-4 h-4" />
          <span className="hidden sm:inline">ลากเพื่อเรียงลำดับ</span>
        </div>
      </div>

      {/* Image info - ด้านล่าง */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 z-20 pointer-events-none">
        <div className="flex items-end justify-between text-white text-xs">
          {/* ขนาดไฟล์ - มุมซ้าย */}
          <div className="bg-black/50 px-2 py-1 rounded">
            {fileSize || '...'}
          </div>

          {/* Dimension - มุมขวา */}
          <div className="bg-black/50 px-2 py-1 rounded">
            {imageDimensions
              ? `${imageDimensions.width}×${imageDimensions.height}`
              : '...'
            }
          </div>
        </div>

        {/* Narrative */}
        {image.narative && (
          <p className="text-white text-xs line-clamp-2 mt-1">
            {image.narative}
          </p>
        )}
      </div>
    </div>
  );
};

const ProductImageView = () => {
  const params = useParams<{ orgId: string; productId: string }>();
  const router = useRouter();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] =
    useState<GetImageImageByItemIDResponse | null>(null);
  const [sortedImages, setSortedImages] = useState<GetImageImageByItemIDResponse[]>([]);

  const [DeleteDialog, confirmDelete] = useConfirm({
    title: "ต้องการลบรูปภาพนี้หรือไม่?",
    message: "การลบรูปภาพนี้จะไม่สามารถกู้คืนได้",
    variant: "destructive",
  });

  const deleteItemImagesByItemId = deleteItemImagesByItemIdApi.useMutation();
  const updateItemImageSortingOrder = updateItemImageSortingOrderApi.useMutation();

  const {
    data: imagesData,
    isLoading,
    refetch,
  } = getItemImageByItemIdApi.useQuery({
    orgId: params.orgId,
    itemId: params.productId,
  });

  const images = imagesData?.data || [];

  // Calculate max sorting order (handle null values)
  const maxSortingOrder = images.length > 0
    ? Math.max(...images.map(img => img.sortingOrder ?? 0))
    : 0;

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update sorted images when data changes
  useEffect(() => {
    console.log('Images data:', imagesData?.data);
    if (imagesData?.data && imagesData.data.length > 0) {
      const sorted = [...imagesData.data].sort((a, b) => {
        const aOrder = a.sortingOrder ?? 0;
        const bOrder = b.sortingOrder ?? 0;
        return aOrder - bOrder;
      });
      console.log('Sorted images:', sorted);
      setSortedImages(sorted);
    } else {
      setSortedImages([]);
    }
  }, [imagesData]);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedImages.findIndex((img) => img.id === active.id);
    const newIndex = sortedImages.findIndex((img) => img.id === over.id);

    const newSortedImages = arrayMove(sortedImages, oldIndex, newIndex);
    setSortedImages(newSortedImages);

    // Update sorting order on server
    try {
      await updateItemImageSortingOrder.mutateAsync({
        orgId: params.orgId,
        itemId: params.productId,
        imageIds: newSortedImages.map((img) => img.id),
      });
      toast.success("อัปเดตลำดับรูปภาพสำเร็จ");
      refetch();
    } catch {
      toast.error("อัปเดตลำดับรูปภาพไม่สำเร็จ");
      // Revert on error
      setSortedImages(sortedImages);
    }
  };

  const handleDelete = async (imageId: string) => {
    const confirmed = await confirmDelete();

    if (!confirmed) return;

    deleteItemImagesByItemId.mutate(
      { orgId: params.orgId, itemImageId: imageId },
      {
        onSuccess: async () => {
          // Refetch to get updated list
          await refetch();

          // Update sorting order after delete
          const remainingImages = sortedImages.filter((img) => img.id !== imageId);
          if (remainingImages.length > 0) {
            try {
              await updateItemImageSortingOrder.mutateAsync({
                orgId: params.orgId,
                itemId: params.productId,
                imageIds: remainingImages.map((img) => img.id),
              });
            } catch (error) {
              console.error("Failed to update sorting order:", error);
            }
          }

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
      <div className="flex items-center justify-between border-b pb-4 sticky top-23 bg-background z-10">
        <div className="flex items-center gap-x-2">
        <ArrowLeftIcon onClick={() => router.back()} className="size-7 flex-shrink-0 cursor-pointer" />
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">รูปภาพสินค้า</h2>
          <p className="text-sm text-muted-foreground">จัดการรูปภาพของสินค้า</p>
        </div>
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
      ) : sortedImages.length === 0 ? (
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedImages.map((img) => img.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedImages.map((image) => (
                <SortableImageItem
                  key={image.id}
                  image={image}
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Upload Modal */}
      <UploadImageModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        orgId={params.orgId}
        productId={params.productId}
        currentMaxSortingOrder={maxSortingOrder}
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
