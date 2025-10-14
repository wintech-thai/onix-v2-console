"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "./use-confirm";
import { useTranslation } from "react-i18next";

type NavigationBlockerContextType = {
  setFormDirty: (isDirty: boolean) => void;
  isFormDirty: boolean;
  handleNavigation: (href: string) => Promise<void>;
};

const NavigationBlockerContext = createContext<NavigationBlockerContextType | null>(null);

type NavigationBlockerProviderProps = {
  children: ReactNode;
};

export function NavigationBlockerProvider({ children }: NavigationBlockerProviderProps) {
  const [isFormDirty, setIsFormDirty] = useState(false);
  const router = useRouter();
  const { t } = useTranslation("product");

  const [ConfirmDialog, confirm] = useConfirm({
    title: t("product.form.leavePage"),
    message: t("product.form.unsavedChanges"),
    variant: "destructive",
  });

  const handleNavigation = useCallback(
    async (href: string) => {
      if (isFormDirty) {
        const ok = await confirm();
        if (ok) {
          setIsFormDirty(false);
          router.push(href);
        }
      } else {
        router.push(href);
      }
    },
    [isFormDirty, confirm, router]
  );

  const setFormDirty = useCallback((isDirty: boolean) => {
    setIsFormDirty(isDirty);
  }, []);

  return (
    <NavigationBlockerContext.Provider
      value={{
        setFormDirty,
        isFormDirty,
        handleNavigation,
      }}
    >
      <ConfirmDialog />
      {children}
    </NavigationBlockerContext.Provider>
  );
}

export function useFormNavigationBlocker() {
  const context = useContext(NavigationBlockerContext);
  if (!context) {
    throw new Error("useFormNavigationBlocker must be used within NavigationBlockerProvider");
  }
  return context;
}
