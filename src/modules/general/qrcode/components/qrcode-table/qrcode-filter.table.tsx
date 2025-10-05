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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface QrCodeFilterTableProps {
  onDelete: () => void;
  isDisabled: boolean;
  onSearch: (searchField: string, searchValue: string) => void;
}

export const QrCodeFilterTable = ({
  onDelete,
  isDisabled,
  onSearch,
}: QrCodeFilterTableProps) => {
  const { t } = useTranslation();
  const [searchField, setSearchField] = useState("fullTextSearch");
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(searchField, searchValue);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full
        flex flex-col gap-3
        md:flex-row md:items-center md:justify-between
      "
      aria-label="QR Code filter controls"
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
              aria-label={t("qrcode.filter.selectSearchField")}
            >
              <SelectValue placeholder={t("qrcode.filter.selectSearchField")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fullTextSearch">{t("qrcode.filter.fullTextSearch")}</SelectItem>
              {/* เพิ่ม options อื่น ๆ ในอนาคตได้ */}
              {/* <SelectItem value="serial">Serial</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Search input */}
        <div className="w-full md:w-auto md:flex-1">
          <Input
            placeholder={t("qrcode.filter.searchPlaceholder")}
            className="w-full"
            aria-label={t("qrcode.filter.searchPlaceholder")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>

        {/* Search button */}
        <div className="w-full md:w-auto">
          <Button type="submit" className="w-full md:w-auto" aria-label={t("qrcode.filter.search")}>
            <Search className="h-4 w-4 mr-2" />
            {t("qrcode.filter.search")}
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
        <Button className="w-full md:w-auto">
          {t("qrcode.filter.add")}
        </Button>

        <Button
          className="w-full md:w-auto"
          disabled={isDisabled}
          onClick={onDelete}
          variant="destructive"
        >
          {t("qrcode.filter.delete")}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full md:w-auto" variant="outline">
              {t("qrcode.filter.config")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuItem onSelect={() => console.log("Scan Item Template")}>
              {t("qrcode.filter.scanItemTemplate")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => console.log("Scan Item Action")}>
              {t("qrcode.filter.scanItemAction")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </form>
  );
};
