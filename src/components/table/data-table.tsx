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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { useActiveRow } from "@/hooks/use-active-row";
import { useTranslation } from "react-i18next";
import { useState, ReactNode, useEffect } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  isLoading?: boolean;
  tableId: string;
  filterComponent?: ReactNode;
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  bannerComponent?: ReactNode;
  onRowSelectionChange?: (rows: Row<TData>[]) => void;
  getRowClassName?: (row: Row<TData>, isActive: boolean) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  tableId,
  filterComponent,
  enableRowSelection = true,
  enableMultiRowSelection = true,
  bannerComponent,
  onRowSelectionChange,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation("common");
  const [rowSelection, setRowSelection] = useState({});
  const { activeRowId, setActiveRowId } = useActiveRow(tableId);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    enableRowSelection,
    enableMultiRowSelection,
  });

  useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, onRowSelectionChange, table]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="h-full flex flex-col">
      {bannerComponent}

      {filterComponent}

      <div className="overflow-auto rounded-md border flex-1 mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
              table.getRowModel().rows.map((row) => {
                const rowId = (row.original as { id: string }).id;
                const isActive = activeRowId === rowId;
                const defaultClassName = isActive
                  ? "bg-blue-50 hover:bg-blue-100"
                  : "";
                const rowClassName = getRowClassName
                  ? getRowClassName(row, isActive)
                  : defaultClassName;

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => setActiveRowId(rowId)}
                    className={`cursor-pointer transition-colors ${rowClassName}`}
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
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t("table.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-2">
          <span className="hidden text-sm text-gray-500 md:block">
            {t("table.rowsPerPage")}
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

        <div className="flex items-center justify-center">
          <span className="text-sm text-gray-500">
            {((currentPage - 1) * itemsPerPage + 1).toLocaleString()}-
            {Math.min(currentPage * itemsPerPage, totalItems).toLocaleString()}{" "}
            {t("table.of")} {totalItems.toLocaleString()}
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
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
