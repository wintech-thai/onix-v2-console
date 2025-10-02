"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-8">
              <SearchX className="size-24 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-7xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            {t("not-found.title")}
          </h2>
          <p className="text-muted-foreground text-base max-w-sm mx-auto">
            {t("not-found.description")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            {t("not-found.goBack")}
          </Button>
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="size-4" />
              {t("not-found.home")}
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            {t("not-found.contactSupport")}
          </p>
        </div>
      </div>
    </div>
  );
}
