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
import { parseAsString, useQueryStates } from "nuqs";
import { useParams } from "next/navigation";
import { RouteConfig } from "@/config/route.config";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface UserFilterTableProps {
  onDelete: () => void;
  isDisabled: boolean;
  onSearch: (searchField: string, searchValue: string) => void;
  selected: number;
}

export const UserFilterTable = ({
  onDelete,
  isDisabled,
  onSearch,
  selected,
}: UserFilterTableProps) => {
  const { t } = useTranslation("user");
  const params = useParams<{ orgId: string }>();
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

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full
        flex flex-col gap-3
        md:flex-row md:items-center md:justify-between
      "
      aria-label="User filter controls"
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
            aria-label={t("filter.search")}
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
        <Link href={RouteConfig.ADMIN.USER.CREATE(params.orgId)}>
          <Button className="w-full md:w-auto">
            {t("filter.add")}
          </Button>
        </Link>
        <Button
          className="w-full md:w-auto"
          disabled={isDisabled}
          onClick={onDelete}
          variant="destructive"
        >
          {t("filter.delete")} {selected ? `(${selected})` : ""}
        </Button>
      </div>
    </form>
  );
};
