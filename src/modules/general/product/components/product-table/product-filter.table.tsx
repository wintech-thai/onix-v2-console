"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RouteConfig } from "@/config/route.config";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface ProductFilterTableProps {
  onDelete: () => void;
  isDisabled: boolean;
  onSearch: (searchField: string, searchValue: string) => void;
  selected: number;
  scanItemId?: string | null;
  onAttach?: () => void;
}

export const ProductFilterTable = ({
  onDelete,
  isDisabled,
  onSearch,
  selected,
  scanItemId,
  onAttach,
}: ProductFilterTableProps) => {
  const { t } = useTranslation("product");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const [searchField, setSearchField] = useState("fullTextSearch");
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(searchField, searchValue);
  };

  const handleBack = () => {
    if (scanItemId) {
      router.replace(RouteConfig.SCAN_ITEMS.ITEM.LIST(params.orgId))
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full
        flex flex-col gap-3
        md:flex-row md:items-center md:justify-between
      "
      aria-label="Product filter controls"
    >
      {/* Left side: search controls */}
      <div
        className="
          w-full
          grid grid-cols-1 gap-2
          sm:grid-cols-[minmax(0,1fr)]
          md:flex md:items-center
        "
      >
        {/* Field selector */}
        <div className="w-full md:w-auto">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger
              className="w-full md:w-48"
              aria-label={t("table.filter.selectSearchField")}
            >
              <SelectValue
                placeholder={t("table.filter.selectSearchField")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fullTextSearch">
                {t("table.filter.fullTextSearch")}
              </SelectItem>
              {/* เพิ่ม options อื่น ๆ ในอนาคตได้ */}
              {/* <SelectItem value="serial">Serial</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Search input */}
        <div className="w-full md:w-[500px]">
          <Input
            placeholder={t("table.filter.searchPlaceholder")}
            className="w-full"
            aria-label={t("table.filter.searchPlaceholder")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            maxLength={50}
          />
        </div>

        {/* Search button */}
        <div className="w-full md:w-auto">
          <Button
            type="submit"
            className="w-full md:w-auto"
            aria-label={t("table.filter.search")}
          >
            <Search className="h-4 w-4 mx-2" />
          </Button>
        </div>
      </div>

      {/* Right side: actions */}
      <div
        className="
          w-full md:w-auto
          grid grid-cols-2 gap-2
          sm:grid-cols-3
          md:flex md:items-center
        "
      >
        {scanItemId && onAttach ? (
          <>
            <Button type="button" onClick={handleBack} className="w-full md:w-auto" variant="destructive">
              {t("table.filter.back")}
            </Button>

            <Button
              className="w-full md:w-auto"
              disabled={selected !== 1}
              onClick={onAttach}
            >
              {t("table.filter.attach")}{" "}
              {selected > 0 ? `(${selected})` : ""}
            </Button>
          </>
        ) : (
          <>
            <Link href={RouteConfig.GENERAL.PRODUCT.CREATE(params.orgId)}>
              <Button className="w-full md:w-auto">
                {t("table.filter.add")}
              </Button>
            </Link>

            <Button
              className="w-full md:w-auto"
              disabled={isDisabled}
              onClick={onDelete}
              variant="destructive"
            >
              {t("table.filter.delete")}{" "}
              {selected > 0 ? `(${selected})` : ""}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};
