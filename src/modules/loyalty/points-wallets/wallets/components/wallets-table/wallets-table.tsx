"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { WalletsFilterTable } from "./wallets-filter.table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useActiveRow } from "@/hooks/use-active-row";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (newPage: number) => void;
  onItemsPerPageChange: (newLimit: number) => void;
  onSearch: (field: string, value: string) => void;
  onDelete: (rows: Row<TData>[], callback: () => void) => void;
  isLoading?: boolean;
  onAdd: () => void;
}

export function WalletsTable<TData, TValue>({
  columns,
  data,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onSearch,
  onDelete,
  isLoading = false,
  onAdd,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation("common");
  const [rowSelection, setRowSelection] = useState({});
  const { activeRowId, setActiveRowId } = useActiveRow("wallets-table");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="h-full flex flex-col">
      <WalletsFilterTable
        onDelete={() =>
          onDelete(table.getSelectedRowModel().rows, () =>
            table.resetRowSelection()
          )
        }
        isDisabled={table.getSelectedRowModel().rows.length === 0}
        onSearch={onSearch}
        selected={table.getSelectedRowModel().rows.length}
        onAdd={onAdd}
      />
      <div className="overflow-auto rounded-md border flex-1 mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin size-4 text-gray-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() =>
                    setActiveRowId((row.original as { id: string }).id)
                  }
                  className={`cursor-pointer transition-colors ${
                    activeRowId === (row.original as { id: string }).id
                      ? "bg-blue-50 hover:bg-blue-100"
                      : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t("table.noResults", "No results.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end mt-4">
        <div className="flex items-center space-x-2">
          <span className="hidden text-sm text-gray-500 md:block">
            {t("table.rowsPerPage", "Rows per page")}
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="min-w-[70px] border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[25, 50, 100, 200].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center ml-4 space-x-2">
          <span className="text-sm text-gray-500">
            {((currentPage - 1) * itemsPerPage + 1).toLocaleString()}-
            {Math.min(currentPage * itemsPerPage, totalItems).toLocaleString()}{" "}
            {t("table.of", "of")} {totalItems.toLocaleString()}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
