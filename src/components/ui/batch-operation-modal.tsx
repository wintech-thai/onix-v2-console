"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface BatchOperationMessages {
  title: string;
  completed: string;
  processing: string;
  processed: string;
  allSuccess: string;
  partialSuccess: string;
}

interface BatchOperationModalProps {
  isOpen: boolean;
  total: number;
  current: number;
  errors: number;
  currentItem?: string;
  isCompleted?: boolean;
  onCancel: () => void;
  onComplete?: () => void;
  messages: BatchOperationMessages;
}

export const BatchOperationModal = ({
  isOpen,
  total,
  current,
  errors,
  currentItem,
  isCompleted = false,
  onCancel,
  onComplete,
  messages,
}: BatchOperationModalProps) => {
  const { t } = useTranslation("common");
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const successCount = current - errors;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isCompleted ? messages.completed : messages.title}
            {!isCompleted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Bar - only show when not completed */}
          {!isCompleted && (
            <div className="space-y-2">
              <Progress value={percentage} className="h-3" />
              <div className="text-right text-sm font-medium text-gray-700">
                {percentage}%
              </div>
            </div>
          )}

          {/* Completion Summary */}
          {isCompleted ? (
            <div className="space-y-4">
              {/* Success/Error Icons and Summary */}
              <div className="flex items-center justify-center">
                {errors === 0 ? (
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                ) : (
                  <XCircle className="h-16 w-16 text-orange-500" />
                )}
              </div>

              <div className="text-center space-y-2">
                <div className="text-lg font-semibold text-gray-900">
                  {errors === 0 ? messages.allSuccess : messages.partialSuccess}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{t("batchOperation.total")}:</span>
                    <span className="font-medium">{total}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>{t("batchOperation.success")}:</span>
                    <span className="font-medium">{successCount}</span>
                  </div>
                  {errors > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>{t("batchOperation.errors")}:</span>
                      <span className="font-medium">{errors}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onComplete}
                  className="flex-1"
                >
                  {t("batchOperation.close")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Status Information - show during progress */}
              <div className="space-y-2 text-sm">
                {currentItem && (
                  <div className="text-gray-600">
                    <span className="font-medium">{messages.processing}:</span>{" "}
                    {currentItem}
                  </div>
                )}

                <div className="text-gray-900">
                  <span className="font-medium">{messages.processed}:</span>{" "}
                  {current} {t("batchOperation.of")} {total}
                </div>

                {errors > 0 && (
                  <div className="text-red-600 font-medium">
                    {t("batchOperation.errors")}: {errors}
                  </div>
                )}
              </div>

              {/* Cancel Button */}
              <div className="pt-2">
                <Button variant="outline" onClick={onCancel} className="w-full">
                  {t("batchOperation.cancel")}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
