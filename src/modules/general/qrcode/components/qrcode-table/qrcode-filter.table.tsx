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
import { parseAsString, useQueryStates } from "nuqs";
import { CreateScanItemModal } from "../modal/create-scan-item.modal";
import { ScanItemActionModal } from "../modal/scan-item-action.modal";

interface QrCodeFilterTableProps {
  onDelete: () => void;
  isDisabled: boolean;
  onSearch: (searchField: string, searchValue: string) => void;
  selected: number;
}

export const QrCodeFilterTable = ({
  onDelete,
  isDisabled,
  onSearch,
  selected,
}: QrCodeFilterTableProps) => {
  const { t } = useTranslation();
  const [queryState] = useQueryStates({
    searchField: parseAsString.withDefault("fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
  });

  const [searchField, setSearchField] = useState("fullTextSearch");
  const [searchValue, setSearchValue] = useState(queryState.searchValue);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(searchField, searchValue);
  };

  const [openScanItemModal, setOpenScanItemModal] = useState(false);

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
      <ScanItemActionModal
        open={openScanItemModal}
        onOpenChange={setOpenScanItemModal}
      />
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
              <SelectItem value="fullTextSearch">
                {t("qrcode.filter.fullTextSearch")}
              </SelectItem>
              {/* เพิ่ม options อื่น ๆ ในอนาคตได้ */}
              {/* <SelectItem value="serial">Serial</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Search input */}
        <div className="w-full md:w-[500px]">
          <Input
            placeholder={t("qrcode.filter.searchPlaceholder")}
            className="w-full"
            aria-label={t("qrcode.filter.searchPlaceholder")}
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
            className="w-full md:w-[80px]"
            aria-label={t("qrcode.filter.search")}
          >
            <Search className="size-4" />
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
        <CreateScanItemModal>
          <Button className="w-full md:w-auto col-span-3">
            {t("qrcode.filter.add")}
          </Button>
        </CreateScanItemModal>

        <Button
          className="w-full md:w-auto"
          disabled={isDisabled}
          onClick={onDelete}
          variant="destructive"
        >
          {t("qrcode.filter.delete")} {selected ? `(${selected})` : ""}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full md:w-auto" variant="outline">
              {t("qrcode.filter.config")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuItem onSelect={() => setOpenScanItemModal(true)}>
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
