
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";

interface IQrCodeModal {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}

export const QrCodeModal = ({ open, onOpenChange, url }: IQrCodeModal) => {
  const { t } = useTranslation("scan-item");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent iconWhite>
        <DialogHeader className="bg-primary text-white rounded-t-lg -m-6 mb-4 p-4">
          <DialogTitle>{t("modal.qrcodeTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <QRCodeSVG
            value={url}
            size={256}
            imageSettings={{
              src: "/logo.png",
              height: 48,
              width: 48,
              excavate: true,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
