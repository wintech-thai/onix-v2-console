"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getScanItemsApi } from "../api/get-scan-items";
import { Button } from "@/components/ui/button";
import {
  FileJson2,
  LayoutGrid,
  Loader,
  Sparkles,
  Copy,
  Check,
  ArrowLeftIcon,
} from "lucide-react";
import JsonView from "@uiw/react-json-view";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type ViewMode = "fields" | "json";

const formatFieldName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const ScanItemViewIdView = () => {
  const { t } = useTranslation("scan-item");
  const router = useRouter();
  const params = useParams<{ orgId: string; scanItemId: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>("fields");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data, isLoading, isError } = getScanItemsApi.useGetScanItemsQuery({
    orgId: params.orgId,
    scanItemId: params.scanItemId,
  });

  const scanItem = data?.data?.scanItem;

  const handleCopy = async (key: string, value: unknown) => {
    try {
      const textToCopy =
        value === null || value === undefined
          ? ""
          : typeof value === "object"
          ? JSON.stringify(value, null, 2)
          : String(value);

      await navigator.clipboard.writeText(textToCopy);
      setCopiedKey(key);
      toast.success(t("detail.copySuccess", { field: formatFieldName(key) }));

      setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    } catch {
      toast.error(t("detail.copyError"));
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  if (isError || !scanItem) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">{t("detail.error")}</h2>
          <p className="text-muted-foreground">
            {t("detail.loadError")}
          </p>
        </div>
      </div>
    );
  }

  const renderFieldsView = () => {
    const entries = Object.entries(scanItem);

    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {entries.map(([key, value], index) => {
            const isCopied = copiedKey === key;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleCopy(key, value)}
                className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-card/50 p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                      {formatFieldName(key)}
                    </span>
                  </div>

                  <div className="mt-1">
                    <p className="text-sm font-medium break-all leading-relaxed text-foreground/90">
                      {value === null || value === undefined ? (
                        <span className="text-muted-foreground italic">
                          {t("detail.noData")}
                        </span>
                      ) : typeof value === "object" ? (
                        <span className="font-mono text-xs bg-muted/50 p-2 rounded block">
                          {JSON.stringify(value, null, 2)}
                        </span>
                      ) : (
                        String(value)
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderJsonView = () => {
    return (
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-card to-card/50 border rounded-xl p-6 shadow-lg"
        >
          <JsonView
            value={scanItem}
            collapsed={false}
            displayDataTypes={false}
            displayObjectSize={true}
            enableClipboard={true}
            shortenTextAfterLength={0}
          >
            <JsonView.Null
              render={(props, { type }) => {
                if (type === 'value') {
                  return (
                    <span
                      {...props}
                      style={{ color: '#f59e0b', fontWeight: 'bold' }}
                    >
                      null
                    </span>
                  );
                }
                return <span {...props} />;
              }}
            />
          </JsonView>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <header className="backdrop-blur-sm bg-background/80 border-b sticky top-0 z-10">
        <div className="w-full px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowLeftIcon
                className="size-6 cursor-pointer"
                onClick={() => router.back()}
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {t("detail.title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("detail.id")}: {params.scanItemId}
                </p>
              </div>
            </div>

            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
              <Button
                variant={viewMode === "fields" ? "default" : "ghost"}
                onClick={() => setViewMode("fields")}
                size="sm"
                className="gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">{t("detail.grid")}</span>
              </Button>
              <Button
                variant={viewMode === "json" ? "default" : "ghost"}
                onClick={() => setViewMode("json")}
                size="sm"
                className="gap-2"
              >
                <FileJson2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t("detail.json")}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-auto">
        {viewMode === "fields" ? renderFieldsView() : renderJsonView()}
      </div>
    </div>
  );
};
