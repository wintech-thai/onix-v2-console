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
          w-[92vw] sm:w-[90vw]
          max-w-[680px] sm:max-w-[720px] md:max-w-[840px]
          max-h-[80vh] overflow-y-auto
          p-4 sm:p-6
        "
      >
        <DialogHeader
          className="
            relative -m-4 sm:-m-6 mb-4 sm:mb-6
            rounded-t-lg bg-primary text-white
            p-4 sm:p-5 pr-12
          "
        >
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {t("qrcode.modal.title")}
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
                absolute top-3.5 md:top-4 right-10 sm:right-12
                text-white/90 hover:text-white transition-colors
              "
              title={t(
                "qrcode.modal.copyTooltip",
                "Copy scan item data to clipboard"
              )}
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
          <div className="space-y-3 sm:space-y-4">
            {/* helper: one row responsive */}
            {(
              [
                {
                  label: t("qrcode.modal.fields.serial"),
                  value: scanItem.serial,
                },
                { label: t("qrcode.modal.fields.pin"), value: scanItem.pin },
                {
                  label: t("qrcode.modal.fields.url"),
                  value: scanItem.url,
                  long: true,
                },
                {
                  label: t("qrcode.modal.fields.uploadPath"),
                  value: scanItem.uploadedPath,
                  long: true,
                },
              ] as { label: string; value?: any; long?: boolean }[]
            ).map((f, i) => (
              <div
                key={i}
                className="
                  flex flex-col sm:flex-row
                  items-start sm:items-center gap-1.5 sm:gap-4
                "
              >
                <label className="text-sm font-medium text-muted-foreground sm:min-w-[140px]">
                  {f.label} :
                </label>
                <div
                  className={`
                    w-full sm:flex-1 md:flex-none md:w-auto md:max-w-max
                    rounded border bg-muted p-2
                    ${f.long ? "break-all md:break-words overflow-x-auto" : ""}
                  `}
                >
                  <span className="select-text">{String(f.value ?? "-")}</span>
                </div>
              </div>
            ))}

            {/* Boolean status – wraps on small screens */}
            <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-4">
              <label className="text-sm font-medium text-muted-foreground sm:min-w-[140px]">
                {/* intentionally empty label space on desktop */}
              </label>
              <div className="w-full sm:flex-1 p-2">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Status
                    ok={scanItem.registeredFlag === "TRUE"}
                    label={t("qrcode.modal.fields.verified")}
                  />
                  <Status
                    ok={scanItem.usedFlag === "TRUE"}
                    label={t("qrcode.modal.fields.used")}
                  />
                  <Status
                    ok={scanItem.appliedFlag === "TRUE"}
                    label={t("qrcode.modal.fields.applied")}
                  />
                </div>
              </div>
            </div>

            {/* Run ID / Sequence No */}
            {[
              {
                label: t("qrcode.modal.fields.runId"),
                value: scanItem.runId,
              },
              {
                label: t("qrcode.modal.fields.sequenceNo"),
                value: scanItem.sequenceNo,
              },
            ].map((f, i) => (
              <div
                key={`second-${i}`}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-4"
              >
                <label className="text-sm font-medium text-muted-foreground sm:min-w-[140px]">
                  {f.label} :
                </label>
                <div
                  className={`
                    w-full sm:flex-1 md:flex-none md:w-auto md:max-w-max
                    rounded border bg-muted p-2
                  `}
                >
                  <span>{String(f.value ?? "-")}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          className="mt-6 w-full sm:w-fit sm:ml-auto"
          onClick={() => setIsOpen(false)}
        >
          {t("common.ok")}
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
      <span className="text-sm">{label}</span>
    </div>
  );
}
