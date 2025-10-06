import { JSX, useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface ConfirmProps {
  title: string;
  message: string;
  variant: ButtonProps["variant"];
}

export const useConfirm = ({
  title,
  message,
  variant,
}: ConfirmProps): [() => JSX.Element, () => Promise<unknown>] => {
  const { t } = useTranslation();
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => {
    return (
      <Dialog open={promise !== null} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClickCapture={handleCancel}
              variant="secondary"
              onClick={handleClose}
            >
              {t("common.cancel")}
            </Button>
            <Button variant={variant} onClick={handleConfirm}>
              {t("common.ok")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return [ConfirmationDialog, confirm];
};
