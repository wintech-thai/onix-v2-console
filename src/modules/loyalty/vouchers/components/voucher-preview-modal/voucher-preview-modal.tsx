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
import { useState, useEffect } from "react";

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
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // QR Code has maximum capacity based on error correction level:
  // Level L (7%): ~2953 chars (numeric), ~1852 chars (alphanumeric), ~1273 chars (binary/byte mode)
  // URLs are typically encoded in byte mode, so practical limit is around 1200-1273 characters
  const isQrUrlTooLong = qrUrl ? qrUrl.length > 1200 : false; // Practical limit for URLs in QR codes

  if (!voucher) return null;

  const isActive = voucher.status === "Active";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg break-words">{t("preview.title")} {voucher.voucherNo ? `: ${voucher.voucherNo}` : null}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 overflow-x-hidden">
          {/* Voucher Card */}
          <div className="border-2 border-gray-300 rounded-lg p-3 md:p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
            {/* Header Section */}
            <div className="text-center mb-3 md:mb-4">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 break-words px-2">
                {voucher.privilegeName}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 break-words px-2">
                {t("preview.privilege")}: {voucher.privilegeCode}
              </p>
            </div>

            {/* Voucher Details with QR Code */}
            <div className="bg-white rounded-lg p-3 md:p-4 mb-3 md:mb-4 shadow-sm">
              <div className="flex gap-4">
                {/* Left side - Voucher Information */}
                <div className="flex-1 grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                  <div>
                    <span className="text-gray-500">{t("preview.voucherNo")}:</span>
                    <p className="font-semibold text-sm md:text-lg text-gray-800 break-all">
                      {voucher.voucherNo}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("preview.pin")}:</span>
                    <p className="font-semibold text-sm md:text-lg text-gray-800 break-all">
                      {voucher.pin || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("preview.startDate")}:</span>
                    <p className="font-medium text-gray-800 text-xs md:text-base">
                      {voucher.startDate
                        ? dayjs(voucher.startDate).format("DD MMM YYYY HH:mm Z")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("preview.endDate")}:</span>
                    <p className="font-medium text-gray-800 text-xs md:text-base">
                      {voucher.endDate
                        ? dayjs(voucher.endDate).format("DD MMM YYYY HH:mm Z")
                        : "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">{t("preview.status")}:</span>
                    <span
                      className={`ml-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        isActive
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : "bg-red-50 text-red-700 ring-red-600/20"
                      }`}
                    >
                      {t(`status.${isActive ? "active" : "disabled"}`)}
                    </span>
                  </div>
                </div>

                {/* Right side - QR Code */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-500 text-center mb-2">
                    {t("preview.qrCode")}
                  </p>
                  {isQrUrlTooLong ? (
                    <div className="h-24 w-24 md:h-32 md:w-32 flex flex-col items-center justify-center gap-1 md:gap-2 p-1 md:p-2">
                      <div className="text-center">
                        <p className="text-gray-600 text-[9px] md:text-[10px] font-medium mb-1">
                          {t("preview.qrUrlTooLong")}
                        </p>
                        <p className="text-gray-400 text-[8px] md:text-[9px]">
                          ({qrUrl?.length} chars)
                        </p>
                      </div>
                      {qrUrl && (
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-blue-500 text-white text-[9px] md:text-[10px] rounded hover:bg-blue-600 transition-colors"
                        >
                          {t("preview.openVerificationPage")}
                        </a>
                      )}
                    </div>
                  ) : qrUrl ? (
                    <QRCodeSVG value={qrUrl} size={windowWidth < 768 ? 80 : 120} level="L" />
                  ) : (
                    <div className="h-24 w-24 md:h-32 md:w-32 flex items-center justify-center text-gray-400 text-[10px] md:text-xs">
                      {t("preview.noQrCode")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Barcode Section */}
            {voucher.barcode && (
              <div className="bg-white rounded-lg p-3 md:p-4 mb-3 md:mb-4 shadow-sm overflow-hidden">
                <p className="text-xs text-gray-500 text-center mb-2">
                  {t("preview.barcode")}
                </p>
                <div className="flex justify-center items-center overflow-hidden">
                  <div className="scale-75 md:scale-100 origin-center">
                    <Barcode
                      value={voucher.barcode}
                      format="CODE128"
                      width={1.5}
                      height={50}
                      displayValue={true}
                      fontSize={12}
                    />
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
