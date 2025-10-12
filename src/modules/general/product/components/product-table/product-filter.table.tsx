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
import { useParams } from "next/navigation";
import { RouteConfig } from "@/config/route.config";
import Link from "next/link";

interface ProductFilterTableProps {
  onDelete: () => void;
  isDisabled: boolean;
  onSearch: (searchField: string, searchValue: string) => void;
}

export const ProductFilterTable = ({
  onDelete,
  isDisabled,
  onSearch,
}: ProductFilterTableProps) => {
  const params = useParams<{ orgId: string }>();
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
              aria-label="เลือกชนิดการค้นหา"
            >
              <SelectValue placeholder="เลือกฟิลด์ค้นหา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fullTextSearch">Full Text Search</SelectItem>
              {/* เพิ่ม options อื่น ๆ ในอนาคตได้ */}
              {/* <SelectItem value="serial">Serial</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Search input */}
        <div className="w-full md:w-auto md:flex-1">
          <Input
            placeholder="Enter search value"
            className="w-full"
            aria-label="ค่าที่ต้องการค้นหา"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>

        {/* Search button */}
        <div className="w-full md:w-auto">
          <Button type="submit" className="w-full md:w-auto" aria-label="ค้นหา">
            <Search className="h-4 w-4 mr-2" />
            Search
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
        <Link href={RouteConfig.GENERAL.PRODUCT.CREATE(params.orgId)}>
          <Button
            className="w-full md:w-auto"
          >
            ADD
          </Button>
        </Link>

        <Button
          className="w-full md:w-auto"
          disabled={isDisabled}
          onClick={onDelete}
          variant="destructive"
        >
          DELETE
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full md:w-auto" variant="outline">
              CONFIG
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuItem
              onSelect={() => console.log("Scan Item Template")}
            >
              Scan Item Template
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => console.log("Scan Item Action")}>
              Scan Item Action
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </form>
  );
};
