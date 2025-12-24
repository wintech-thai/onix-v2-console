"use client";

import { fetchScanMapDataApi } from "../api/fetch-scan-map.api";
import { useParams, useRouter } from "next/navigation";
import { useQueryStates, parseAsString } from "nuqs";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Loader, BarChart3, ArrowLeftIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ScanMapAggregations } from "../components/scan-map-aggregations";

// Dynamically import map component to avoid SSR issues
const ScanMap = dynamic(() => import("../components/scan-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader className="animate-spin size-6 text-gray-500" />
    </div>
  ),
});

const ScanMapView = () => {
  const { t } = useTranslation(["scan-map", "common"]);
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [queryState] = useQueryStates({
    dateFrom: parseAsString.withDefault(dayjs().startOf("day").toISOString()),
    dateTo: parseAsString.withDefault(dayjs().endOf("day").toISOString()),
    searchField: parseAsString.withDefault(""),
    searchValue: parseAsString.withDefault(""),
  });

  const { dateFrom, dateTo, searchField, searchValue } = queryState;

  const fetchScanMapData = fetchScanMapDataApi.useFetchScanMapData({
    orgId: params.orgId,
    dateFrom,
    dateTo,
    searchField: searchField || undefined,
    searchValue: searchValue || undefined,
  });

  const mapData = useMemo(
    () => fetchScanMapData.data?.mapData || [],
    [fetchScanMapData.data?.mapData]
  );
  const aggregations = fetchScanMapData.data?.aggregations;

  // Generate color palette for products
  const productColors = useMemo(() => {
    const uniqueProducts = Array.from(
      new Set(mapData.map((d) => d.productCode).filter(Boolean))
    );
    const colors: Record<string, string> = {};
    const hueStep = 360 / Math.max(uniqueProducts.length, 1);

    uniqueProducts.forEach((product, index) => {
      const hue = (index * hueStep) % 360;
      colors[product!] = `hsl(${hue}, 70%, 50%)`;
    });

    return colors;
  }, [mapData]);

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-2 z-10">
        <h1 className="text-lg font-bold">
          <ArrowLeftIcon
            onClick={() => router.back()}
            className="inline cursor-pointer"
          />{" "}
          {t("title")}
        </h1>

        {/* Analytics Button - Mobile Only */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden ml-auto">
              <BarChart3 className="size-4 mr-2" />
              {t("analytics")}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-4">
            <SheetHeader>
              <SheetTitle>{t("analytics")}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto h-[calc(100%-60px)]">
              <ScanMapAggregations
                productAggregations={aggregations?.byProduct}
                provinceAggregations={aggregations?.byProvince}
                emailAggregations={aggregations?.byEmail}
                productColors={productColors}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="ml-auto lg:ml-0 text-sm text-muted-foreground">
          {mapData.length.toLocaleString()} {t("locations")}
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map - Full screen on mobile, Left side on desktop */}
        <div className="flex-1 relative">
          {fetchScanMapData.isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader className="animate-spin size-6 text-gray-500" />
            </div>
          ) : (
            <ScanMap mapData={mapData} productColors={productColors} />
          )}
        </div>

        {/* Sidebar - Hidden on mobile, visible on desktop (lg+) */}
        <div className="hidden lg:block w-80 bg-gray-50 border-l overflow-y-auto">
          <div className="p-4">
            <ScanMapAggregations
              productAggregations={aggregations?.byProduct}
              provinceAggregations={aggregations?.byProvince}
              emailAggregations={aggregations?.byEmail}
              productColors={productColors}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanMapView;
