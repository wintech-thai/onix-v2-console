import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ShowApiKeyModalProps {
  isOpen: boolean;
  apiKey: string;
}

export const ShowApiKeyModal = ({
  isOpen,
  apiKey,
}: ShowApiKeyModalProps) => {
  const { t } = useTranslation("apikey");
  const router = useRouter();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success(t("modal.copiedSuccess"));
    } catch {
      toast.error(t("modal.copiedError"));
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent iconWhite>
        <DialogHeader className="bg-primary text-white rounded-t-lg -m-6 mb-0.5 p-4">
          <DialogTitle>{t("modal.apiKeyCreatedTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("modal.apiKeyCreatedMessage")}
          </p>

          <div className="relative">
            <textarea
              readOnly
              value={apiKey}
              className="w-full p-3 pr-12 border rounded-md resize-none font-mono text-sm bg-muted"
              rows={4}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={handleCopy}
            >
              <Copy className="size-4" />
            </Button>
          </div>

          <div className="justify-end flex items-center">
            <Button type="button" onClick={handleClose}>
              {t("modal.ok")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
