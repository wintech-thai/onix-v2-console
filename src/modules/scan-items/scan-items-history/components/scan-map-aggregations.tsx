"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";

interface ProductAggregation {
  productCode: string;
  productDesc: string;
  count: number;
}

interface ProvinceAggregation {
  province: string;
  count: number;
}

interface EmailAggregation {
  email: string;
  count: number;
}

interface ScanMapAggregationsProps {
  productAggregations?: ProductAggregation[];
  provinceAggregations?: ProvinceAggregation[];
  emailAggregations?: EmailAggregation[];
  productColors: Record<string, string>;
}

export const ScanMapAggregations = ({
  productAggregations = [],
  provinceAggregations = [],
  emailAggregations = [],
  productColors,
}: ScanMapAggregationsProps) => {
  const { t } = useTranslation("scan-map");

  return (
    <div className="space-y-4">
      {/* Product Aggregation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("aggregations.product.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">
                  {t("aggregations.product.name")}
                </TableHead>
                <TableHead className="text-xs text-right w-16">
                  {t("aggregations.product.count")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productAggregations.slice(0, 5).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            productColors[item.productCode] || "#999",
                        }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-xs truncate">
                          {item.productCode}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {item.productDesc}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-xs py-2">
                    {item.count.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {!productAggregations.length && (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground text-xs py-4"
                  >
                    {t("aggregations.product.noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Province Aggregation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("aggregations.province.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">
                  {t("aggregations.province.name")}
                </TableHead>
                <TableHead className="text-xs text-right w-16">
                  {t("aggregations.province.count")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {provinceAggregations.slice(0, 5).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-xs py-2 truncate">
                    {item.province}
                  </TableCell>
                  <TableCell className="text-right font-medium text-xs py-2">
                    {item.count.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {!provinceAggregations.length && (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground text-xs py-4"
                  >
                    {t("aggregations.province.noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Email Aggregation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("aggregations.email.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">
                  {t("aggregations.email.address")}
                </TableHead>
                <TableHead className="text-xs text-right w-16">
                  {t("aggregations.email.count")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailAggregations.slice(0, 5).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-[10px] py-2 truncate max-w-[150px]">
                    {item.email}
                  </TableCell>
                  <TableCell className="text-right font-medium text-xs py-2">
                    {item.count.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {!emailAggregations.length && (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground text-xs py-4"
                  >
                    {t("aggregations.email.noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
