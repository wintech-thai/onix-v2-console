"use client";

import { Button, buttonVariants } from "@/components/ui/button";
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
import { useTranslation } from "react-i18next";
import { parseAsString, useQueryStates } from "nuqs";
import { useParams, useRouter } from "next/navigation";
import { RouteConfig } from "@/config/route.config";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CustomerFilterTableProps {
  onDelete: () => void;
  isDisabled: boolean;
  onSearch: (searchField: string, searchValue: string) => void;
  selected: number;
  scanItemId?: string | null;
  onAttach?: () => void;
}

export const CustomerFilterTable = ({
  onDelete,
  isDisabled,
  onSearch,
  selected,
  scanItemId,
  onAttach,
}: CustomerFilterTableProps) => {
  const { t } = useTranslation("cronjob");
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
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

  const handleBack = () => {
    if (scanItemId) {
      router.replace(RouteConfig.GENERAL.QRCODE(params.orgId))
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full
        flex flex-col gap-3
        md:flex-row md:items-center md:justify-between
      "
      aria-label="Cronjob filter controls"
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
              aria-label={t("filter.selectSearchField")}
            >
              <SelectValue placeholder={t("filter.selectSearchField")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fullTextSearch">
                {t("filter.fullTextSearch")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search input */}
        <div className="w-full md:w-[500px]">
          <Input
            placeholder={t("filter.searchPlaceholder")}
            className="w-full"
            aria-label={t("filter.searchPlaceholder")}
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
            aria-label={t("filter.search")}
          >
            <Search className="size-4" />
          </Button>
        </div>
      </div>

      {/* Right side: actions */}
      <div
        className="
          w-full md:w-auto
          grid grid-cols-1 gap-2
          md:flex md:items-center
        "
      >
        {scanItemId && onAttach ? (
          <>
            <Button type="button" onClick={handleBack} className="w-full md:w-auto" variant="destructive">
              Back
            </Button>

            <Button
              className="w-full md:w-auto"
              disabled={selected !== 1}
              onClick={onAttach}
            >
              Attach{" "}
              {selected > 0 ? `(${selected})` : ""}
            </Button>
          </>
        ) : (
          <>
            <Link
              className={cn(buttonVariants({ variant: "default" }))}
              href={RouteConfig.GENERAL.CUSTOMER.CREATE(params.orgId)}
            >
              add
            </Link>
            <Button
              className="w-full md:w-auto"
              disabled={isDisabled}
              onClick={onDelete}
              variant="destructive"
            >
              delete {selected ? `(${selected})` : ""}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};
