import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { getScanItemsApi } from "../../api/get-scan-items";
import { useState } from "react";
import { Loader, CheckIcon, XIcon, CopyIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ScanItemDetailModalProps {
  orgId: string;
  scanItemId: string;
  children: React.ReactNode;
}

export const ScanItemDetailModal = ({
  orgId,
  scanItemId,
  children,
}: ScanItemDetailModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  // Query only when modal is open
  const getScanItem = getScanItemsApi.useGetScanItemsQuery(
    { orgId, scanItemId },
    { enabled: isOpen }
  );

  const scanItem = getScanItem.data?.data?.scanItem;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent iconWhite className="min-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader className="relative bg-primary text-white rounded-t-lg -m-6 mb-4 p-4">
          <DialogTitle className="text-xl font-semibold">
            {t("qrcode.modal.title")}
          </DialogTitle>
          {/* Copy button positioned next to close button */}
          {scanItem && (
            <button
              type="button"
              onClick={() => {
                const payload = JSON.stringify({
                  id: scanItem.id,
                  orgId: scanItem.orgId,
                  serial: scanItem.serial,
                  pin: scanItem.pin,
                  url: scanItem.url,
                  uploadedPath: scanItem.uploadedPath,
                  registeredFlag: scanItem.registeredFlag,
                  usedFlag: scanItem.usedFlag,
                  appliedFlag: scanItem.appliedFlag,
                  runId: scanItem.runId,
                  sequenceNo: scanItem.sequenceNo,
                  scanCount: scanItem.scanCount,
                  tags: scanItem.tags,
                  productCode: scanItem.productCode,
                  itemGroup: scanItem.itemGroup,
                  itemId: scanItem.itemId,
                  customerId: scanItem.customerId,
                  createdDate: scanItem.createdDate,
                  registeredDate: scanItem.registeredDate
                }, null, 2);
                navigator.clipboard.writeText(payload);
                toast.success(t("qrcode.modal.copySuccess", "Copied to clipboard"));
              }}
              className="absolute top-4 right-12 text-white transition-colors"
              title={t("qrcode.modal.copyTooltip", "Copy scan item data to clipboard")}
            >
              <CopyIcon className="h-4 w-4" />
            </button>
          )}
        </DialogHeader>

        {getScanItem.isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin size-6 mr-2" />
            <span>{t("qrcode.modal.loading")}</span>
          </div>
        )}

        {getScanItem.isError && (
          <div className="flex items-center justify-center py-8 text-red-500">
            <XIcon className="size-6 mr-2" />
            <span>{t("qrcode.modal.error")}</span>
          </div>
        )}

        {scanItem && (
          <div className="space-y-3">
{/* First group: Serial, Pin, URL, Upload Path */}
            {[
              {
                label: t("qrcode.modal.fields.serial"),
                value: scanItem.serial,
                type: "text"
              },
              {
                label: t("qrcode.modal.fields.pin"),
                value: scanItem.pin,
                type: "text"
              },
              {
                label: t("qrcode.modal.fields.url"),
                value: scanItem.url,
                type: "text",
                breakAll: true
              },
              {
                label: t("qrcode.modal.fields.uploadPath"),
                value: scanItem.uploadedPath,
                type: "text",
                breakAll: true
              }
            ].map((field, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-x-4">
                <label className="text-sm font-medium text-muted-foreground min-w-[140px] flex-shrink-0">
                  {field.label} :
                </label>
                <div className={`flex-1 p-2 bg-muted rounded border overflow-hidden ${field.breakAll ? 'break-all' : 'break-words'}`}>
                  <span className="block truncate">{field.value}</span>
                </div>
              </div>
            ))}

            {/* Boolean Status in one line */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-x-4">
              <label className="text-sm font-medium text-muted-foreground min-w-[140px] flex-shrink-0">
                Status :
              </label>
              <div className="flex-1 p-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
                  <div className="flex items-center">
                    {scanItem.registeredFlag === "TRUE" ? (
                      <CheckIcon className="size-4 text-green-500 mr-1" />
                    ) : (
                      <XIcon className="size-4 text-red-500 mr-1" />
                    )}
                    <span className="text-sm">{t("qrcode.modal.fields.verified")}</span>
                  </div>

                  <div className="flex items-center">
                    {scanItem.usedFlag === "TRUE" ? (
                      <CheckIcon className="size-4 text-green-500 mr-1" />
                    ) : (
                      <XIcon className="size-4 text-red-500 mr-1" />
                    )}
                    <span className="text-sm">{t("qrcode.modal.fields.used")}</span>
                  </div>

                  <div className="flex items-center">
                    {scanItem.appliedFlag === "TRUE" ? (
                      <CheckIcon className="size-4 text-green-500 mr-1" />
                    ) : (
                      <XIcon className="size-4 text-red-500 mr-1" />
                    )}
                    <span className="text-sm">{t("qrcode.modal.fields.applied")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Second group: Run ID, Sequence No */}
            {[
              {
                label: t("qrcode.modal.fields.runId"),
                value: scanItem.runId,
                type: "text"
              },
              {
                label: t("qrcode.modal.fields.sequenceNo"),
                value: scanItem.sequenceNo,
                type: "text"
              }
            ].map((field, index) => (
              <div key={`second-${index}`} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-x-4">
                <label className="text-sm font-medium text-muted-foreground min-w-[140px] flex-shrink-0">
                  {field.label} :
                </label>
                <div className="flex-1 p-2 bg-muted rounded border overflow-hidden">
                  <span className="block truncate">{field.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button className="mt-6 w-fit ml-auto" onClick={() => setIsOpen(false)}>
          {t("common.ok")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
