"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JsonView from "@uiw/react-json-view";
import { useTranslation } from "react-i18next";

interface AuditLogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Record<string, unknown>;
}

export const AuditLogDetailDialog = ({
  open,
  onOpenChange,
  data,
}: AuditLogDetailDialogProps) => {
  const { t } = useTranslation("audit-log");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent iconWhite className="min-w-full md:min-w-3xl max-h-[80vh]">
        <DialogHeader className="bg-primary text-white rounded-t-lg -m-6 mb-4 p-4">
          <DialogTitle>{t("detail.title")}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto h-[calc(80vh-100px)] w-full pr-4">
          <JsonView
            value={data}
            collapsed={false}
            displayDataTypes={false}
            enableClipboard={true}
            shortenTextAfterLength={0}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
