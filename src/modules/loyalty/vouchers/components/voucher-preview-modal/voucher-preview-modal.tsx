"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IVoucher } from "../../api/fetch-vouchers.api";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";

interface VoucherPreviewModalProps {
  open: boolean;
  voucher: IVoucher | null;
  qrUrl: string | null;
  onOpenChange: (open: boolean) => void;
}

export const VoucherPreviewModal = ({
  open,
  voucher,
  qrUrl,
  onOpenChange,
}: VoucherPreviewModalProps) => {
  const { t } = useTranslation(["voucher"]);

  // QR Code has maximum capacity based on error correction level:
  // Level L (7%): ~2953 chars (numeric), ~1852 chars (alphanumeric), ~1273 chars (binary/byte mode)
  // URLs are typically encoded in byte mode, so practical limit is around 1200-1273 characters
  const isQrUrlTooLong = qrUrl ? qrUrl.length > 1200 : false; // Practical limit for URLs in QR codes

  if (!voucher) return null;

  const isActive = voucher.status === "Active";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("preview.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Voucher Card */}
          <div className="border-2 border-gray-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
            {/* Header Section */}
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {voucher.privilegeName}
              </h3>
              <p className="text-sm text-gray-600">
                {t("preview.privilege")}: {voucher.privilegeCode}
              </p>
            </div>

            {/* Voucher Details */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t("preview.voucherNo")}:</span>
                  <p className="font-semibold text-lg text-gray-800">
                    {voucher.voucherNo}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">{t("preview.pin")}:</span>
                  <p className="font-semibold text-lg text-gray-800">
                    {voucher.pin || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">{t("preview.startDate")}:</span>
                  <p className="font-medium text-gray-800">
                    {voucher.startDate
                      ? dayjs(voucher.startDate).format("DD MMM YYYY")
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">{t("preview.endDate")}:</span>
                  <p className="font-medium text-gray-800">
                    {voucher.endDate
                      ? dayjs(voucher.endDate).format("DD MMM YYYY")
                      : "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">{t("preview.status")}:</span>
                  <span
                    className={`ml-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      isActive
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "bg-gray-50 text-gray-600 ring-gray-500/10"
                    }`}
                  >
                    {t(`status.${isActive ? "active" : "disabled"}`)}
                  </span>
                </div>
              </div>
            </div>

            {/* Barcode Section */}
            {voucher.barcode && (
              <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <p className="text-xs text-gray-500 text-center mb-2">
                  {t("preview.barcode")}
                </p>
                <div className="flex justify-center">
                  <Barcode
                    value={voucher.barcode}
                    format="CODE128"
                    width={2}
                    height={60}
                    displayValue={true}
                    fontSize={14}
                  />
                </div>
              </div>
            )}

            {/* QR Code Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 text-center mb-2">
                {t("preview.qrCode")}
              </p>
              <div className="flex justify-center">
                {isQrUrlTooLong ? (
                  <div className="h-40 w-40 flex flex-col items-center justify-center gap-3 p-3">
                    <div className="text-center">
                      <p className="text-gray-600 text-xs font-medium mb-1">
                        {t("preview.qrUrlTooLong")}
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        ({qrUrl?.length} chars)
                      </p>
                    </div>
                    {qrUrl && (
                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        {t("preview.openVerificationPage")}
                      </a>
                    )}
                  </div>
                ) : qrUrl ? (
                  <QRCodeSVG value={qrUrl} size={160} level="L" />
                ) : (
                  <div className="h-40 w-40 flex items-center justify-center text-gray-400 text-sm">
                    {t("preview.noQrCode")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
