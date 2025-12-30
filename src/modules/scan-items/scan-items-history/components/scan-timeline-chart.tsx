"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TimelineDataPoint } from "../api/fetch-scan-timeline.api";
import dayjs from "dayjs";

interface ScanTimelineChartProps {
  data: TimelineDataPoint[];
  productColors: Record<string, string>;
  isLoading?: boolean;
  interval?: string;
}

// Format timestamp based on interval - moved outside component
const formatTimestamp = (timestamp: string, interval?: string) => {
  const date = dayjs(timestamp);

  if (interval === "1h" || interval === "3h" || interval === "6h") {
    return date.format("MMM DD HH:mm");
  } else {
    return date.format("MMM DD");
  }
};

export const ScanTimelineChart = ({
  data,
  productColors,
  isLoading,
  interval,
}: ScanTimelineChartProps) => {
  const { t } = useTranslation("scan-items-history");

  // Get all unique products from the data
  const products = useMemo(() => {
    const productSet = new Set<string>();
    data.forEach((point) => {
      Object.keys(point.productCounts).forEach((product) => {
        productSet.add(product);
      });
    });
    return Array.from(productSet).sort();
  }, [data]);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return data.map((point) => {
      const formattedTime = formatTimestamp(point.timestamp, interval);
      return {
        time: formattedTime,
        ...point.productCounts,
        total: point.total,
      };
    });
  }, [data, interval]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("chart.title")}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader className="animate-spin size-6 text-gray-500" />
            <p className="text-sm text-muted-foreground">
              {t("chart.loading")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("chart.title")}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{t("chart.noData")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{
                value: t("chart.scans"),
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
            {products.map((product) => (
              <Bar
                key={product}
                dataKey={product}
                stackId="a"
                fill={productColors[product] || "#999"}
                name={product}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
