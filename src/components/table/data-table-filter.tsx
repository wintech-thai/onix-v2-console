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
import { ReactNode } from "react";

interface SearchField {
  value: string;
  label: string;
}

interface DataTableFilterProps {
  onSearch: (searchField: string, searchValue: string) => void;
  searchPlaceholder?: string;
  searchFields?: SearchField[];
  leftActions?: ReactNode;
  rightActions?: ReactNode;
}

export const DataTableFilter = ({
  onSearch,
  searchPlaceholder = "Search...",
  searchFields = [{ value: "fullTextSearch", label: "All Fields" }],
  leftActions,
  rightActions,
}: DataTableFilterProps) => {
  const [queryState] = useQueryStates({
    searchField: parseAsString.withDefault(searchFields[0]?.value || "fullTextSearch"),
    searchValue: parseAsString.withDefault(""),
  });

  const [searchField, setSearchField] = useState(
    queryState.searchField || searchFields[0]?.value || "fullTextSearch"
  );
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
      aria-label="Data table filter controls"
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
        {searchFields.length > 1 && (
          <div className="w-full md:w-auto">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-full md:w-48" aria-label="Select search field">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {searchFields.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Search input */}
        <div className="w-full md:w-[500px]">
          <Input
            placeholder={searchPlaceholder}
            className="w-full"
            aria-label="Search"
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
          <Button type="submit" className="w-full md:w-[80px]" aria-label="Search">
            <Search className="size-4" />
          </Button>
        </div>

        {/* Left custom actions */}
        {leftActions}
      </div>

      {/* Right side: actions */}
      {rightActions && (
        <div
          className="
            w-full md:w-auto
            grid grid-cols-1 gap-2
            md:flex md:items-center
          "
        >
          {rightActions}
        </div>
      )}
    </form>
  );
};
