"use client";

import { dashboardStatsApi } from "../api/dashboard-stats.api";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { NoPermissionsPage } from "@/components/ui/no-permissions";

interface StatCardProps {
  title: string;
  value: number;
  total?: number;
  label: string;
  gradient: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const StatCard = ({
  title,
  value,
  total,
  label,
  gradient,
  icon,
  isLoading,
}: StatCardProps) => {
  const percentage = total ? Math.min((value / total) * 100, 100) : 0;
  const formattedValue = value.toLocaleString("en-US");
  const formattedTotal = total?.toLocaleString("en-US");

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-16 w-32 mb-4" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 group"
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${gradient}`}
      />

      {/* Icon Background */}
      <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="text-[120px] transform rotate-12">{icon}</div>
      </div>

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {formattedValue}
              </h2>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${gradient} bg-opacity-10`}>
            <div className="text-2xl">{icon}</div>
          </div>
        </div>

        {/* Label and Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">{label}</span>
            {total && (
              <span className="font-semibold text-foreground/80">
                {formattedTotal}
              </span>
            )}
          </div>

          {total && (
            <div className="space-y-1">
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {percentage.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const OverViewViewPage = () => {
  const params = useParams<{ orgId: string }>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useTranslation("dashboard");

  const currentStats =
    dashboardStatsApi.GetCurrentBalanceStats.useGetCurrentBalanceStats({
      orgId: params.orgId,
    });

  const getLimits = dashboardStatsApi.GetLimits.useGetLimits({
    orgId: params.orgId,
  });

  if (currentStats.isError) {
    if (currentStats.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetJobs" />;
    }
    throw new Error(currentStats.error.message);
  }

  if (getLimits.isError) {
    if (getLimits.error?.response?.status === 403) {
      return <NoPermissionsPage apiName="GetJobCount" />;
    }
    throw new Error(getLimits.error.message);
  }

  const stats = currentStats?.data?.data || [];
  const limits = getLimits?.data?.data || [];

  const scanItemCurrent =
    stats.find((s) => s.statCode === "ScanItemBalanceCurrent")?.balanceEnd || 0;
  const scanItemScanned =
    stats.find((s) => s.statCode === "ScanItemRegisteredBalanceCurrent")
      ?.balanceEnd || 0;
  const scanItemApplied =
    stats.find((s) => s.statCode === "ScanItemAppliedBalanceCurrent")
      ?.balanceEnd || 0;
  const scanItemLimit =
    limits.find((l) => l.statCode === "ScanItemBalanceCurrent")?.limit || 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([currentStats.refetch(), getLimits.refetch()]);
    // Add minimum loading time for UX
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const isLoading =
    currentStats.isLoading || getLimits.isLoading || isRefreshing;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="backdrop-blur-sm bg-background/80 border-b sticky top-0 z-10">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("overview.title")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("overview.subtitle")}
              </p>
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">{t("overview.refresh")}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Scan Item */}
            <StatCard
              title={t("overview.cards.totalScanItem.title")}
              value={scanItemCurrent}
              total={scanItemLimit}
              label={t("overview.cards.totalScanItem.label")}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              icon="📊"
              isLoading={isLoading}
            />

            {/* Total Scan Item Scanned */}
            <StatCard
              title={t("overview.cards.totalScanned.title")}
              value={scanItemScanned}
              total={scanItemCurrent}
              label={t("overview.cards.totalScanned.label")}
              gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              icon="✅"
              isLoading={isLoading}
            />

            {/* Total Scan Item Applied */}
            <StatCard
              title={t("overview.cards.totalApplied.title")}
              value={scanItemApplied}
              total={scanItemCurrent}
              label={t("overview.cards.totalApplied.label")}
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              icon="🎯"
              isLoading={isLoading}
            />
          </div>

          {/* Additional Info */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 rounded-2xl border bg-card/50 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("overview.summary.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <Trans
                      i18nKey="overview.summary.description"
                      ns="dashboard"
                      values={{
                        current: scanItemCurrent.toLocaleString(),
                        limit: scanItemLimit.toLocaleString(),
                        scanned: scanItemScanned.toLocaleString(),
                        applied: scanItemApplied.toLocaleString(),
                      }}
                      components={{
                        strong: (
                          <span className="font-semibold text-foreground" />
                        ),
                      }}
                    />
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverViewViewPage;
