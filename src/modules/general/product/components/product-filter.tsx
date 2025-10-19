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
import { useTranslation } from "react-i18next";

interface ProductFilterProps {
  onSearch: (searchField: string, searchValue: string) => void;
  initialSearchField?: string;
  initialSearchValue?: string;
}

export const ProductFilter = ({
  onSearch,
  initialSearchField = "fullTextSearch",
  initialSearchValue = "",
}: ProductFilterProps) => {
  const { t } = useTranslation("product");
  const [searchField, setSearchField] = useState(initialSearchField);
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(searchField, searchValue);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-3 md:flex-row md:items-center"
      aria-label="Product filter controls"
    >
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
          </SelectContent>
        </Select>
      </div>

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

      <div className="w-full md:w-auto">
        <Button
          type="submit"
          className="w-full md:w-auto"
          aria-label={t("table.filter.search")}
        >
          <Search className="h-4 w-4 mx-2" />
        </Button>
      </div>
    </form>
  );
};
