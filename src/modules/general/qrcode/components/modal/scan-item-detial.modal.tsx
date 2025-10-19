/* eslint-disable  @typescript-eslint/no-explicit-any */

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
import { cn } from "@/lib/utils";

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
  const { t } = useTranslation(["common", "scan-item"]);

  const getScanItem = getScanItemsApi.useGetScanItemsQuery(
    { orgId, scanItemId },
    { enabled: isOpen }
  );

  const scanItem = getScanItem.data?.data?.scanItem;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      {/* width responsive + safe max height */}
      <DialogContent
        iconWhite
        className="
          w-[95vw] sm:w-[90vw] md:max-w-3xl lg:w-[80vw]
          p-3 sm:p-4 md:p-6
        "
      >
        <DialogHeader
          className="
            relative -m-3 sm:-m-4 md:-m-6 mb-3 sm:mb-4 md:mb-6
            rounded-t-lg bg-primary text-white
            p-3 sm:p-4 md:p-5 pr-10 sm:pr-12
          "
        >
          <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold">
            {t("scan-item:modal.title")}
          </DialogTitle>

          {scanItem && (
            <button
              type="button"
              onClick={() => {
                const payload = JSON.stringify(
                  {
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
                    registeredDate: scanItem.registeredDate,
                  },
                  null,
                  2
                );
                navigator.clipboard.writeText(payload);
                toast.success(
                  t("qrcode.modal.copySuccess", "Copied to clipboard")
                );
              }}
              className="
                      absolute top-3 md:top-3 right-10 md:right-10
                      text-white/90 hover:text-white transition-colors
                      p-1
                    "
            >
              <CopyIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}
        </DialogHeader>

        {getScanItem.isLoading && (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <Loader className="animate-spin size-5 sm:size-6 mr-2" />
            <span className="text-sm sm:text-base">
              {t("scan-item:modal.loading")}
            </span>
          </div>
        )}

        {getScanItem.isError && (
          <div className="flex items-center justify-center py-6 sm:py-8 text-red-500">
            <XIcon className="size-5 sm:size-6 mr-2" />
            <span className="text-sm sm:text-base">
              {t("scan-item:modal.error")}
            </span>
          </div>
        )}

        {scanItem && (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {/* helper: one row responsive */}
            <div
              className="
                  flex flex-col sm:flex-row
                  items-start sm:items-center gap-1 sm:gap-2 md:gap-4
                "
            >
              <label className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[120px] md:min-w-[140px] shrink-0">
                {t("scan-item:modal.fields.serial")} :
              </label>

              <div
                className={cn("rounded border bg-muted p-1.5 sm:p-2 w-[170px]")}
              >
                {String(scanItem.serial ?? "-")}
              </div>

              {/* Boolean status – wraps on small screens */}
              <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-4">
                <div className="w-full sm:flex-1 p-2">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Status
                      ok={scanItem.registeredFlag === "TRUE"}
                      label={t("scan-item:modal.fields.verified")}
                    />
                    <Status
                      ok={scanItem.usedFlag === "TRUE"}
                      label={t("scan-item:modal.fields.used")}
                    />
                    <Status
                      ok={scanItem.appliedFlag === "TRUE"}
                      label={t("scan-item:modal.fields.applied")}
                    />
                  </div>
                </div>
              </div>
            </div>
            {(
              [
                { label: t("scan-item:modal.fields.pin"), value: scanItem.pin },
                {
                  label: t("scan-item:modal.fields.url"),
                  value: scanItem.url,
                  long: true,
                },
                {
                  label: t("scan-item:modal.fields.uploadPath"),
                  value: scanItem.uploadedPath,
                  long: true,
                },
              ] as { label: string; value?: any; long?: boolean }[]
            ).map((f, i) => (
              <div
                key={i}
                className="
                  flex flex-col sm:flex-row
                  items-start sm:items-center gap-1 sm:gap-2 md:gap-4
                "
              >
                <label className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[120px] md:min-w-[140px] shrink-0">
                  {f.label} :
                </label>

                <div
                  className={cn(
                    "rounded border bg-muted p-1.5 sm:p-2",
                    f.long ? "min-w-0 flex-1 overflow-hidden" : ""
                  )}
                >
                  {f.long && f.value ? (
                    <div className="w-full">
                      <span className="select-text text-xs sm:text-sm break-all whitespace-pre-wrap line-clamp-1">
                        {String(f.value)}
                      </span>
                    </div>
                  ) : (
                    <span className="select-text text-xs sm:text-sm block w-[150px]">
                      {String(f.value ?? "-")}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Run ID / Sequence No */}
            {[
              {
                label: t("scan-item:modal.fields.runId"),
                value: scanItem.runId,
              },
              {
                label: t("scan-item:modal.fields.sequenceNo"),
                value: scanItem.sequenceNo,
              },
            ].map((f, i) => (
              <div
                key={`second-${i}`}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 md:gap-4"
              >
                <label className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[120px] md:min-w-[140px] shrink-0">
                  {f.label} :
                </label>
                <div className="rounded border bg-muted p-1.5 sm:p-2">
                  <span className="select-text text-xs sm:text-sm block w-[150px]">
                    {String(f.value ?? "-")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          className="mt-4 sm:mt-6 w-full sm:w-fit sm:ml-auto text-sm sm:text-base"
          onClick={() => setIsOpen(false)}
        >
          {t("common:common.ok")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

/** small presentational helper */
function Status({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center">
      {ok ? (
        <CheckIcon className="size-4 text-green-500 mr-1" />
      ) : (
        <XIcon className="size-4 text-red-500 mr-1" />
      )}
      <span className="text-xs sm:text-sm">{label}</span>
    </div>
  );
}
