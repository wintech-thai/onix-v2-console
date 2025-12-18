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
import { ScanItemsActionFilterTable } from "./scan-items-action-filter.table";
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

interface AttachmentMode {
  title: string;
  description: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDelete: (rows: Row<TData>[], callback: () => void) => void;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onSearch: (searchField: string, searchValue: string) => void;
  isLoading?: boolean;
  attachmentId?: string | null;
  onAttach?: (rows: Row<TData>[], callback: () => void) => void;
  attachmentMode?: AttachmentMode;
}

export function ScanItemsActionTable<TData, TValue>({
  columns,
  data,
  onDelete,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onSearch,
  isLoading = false,
  attachmentId,
  onAttach,
  attachmentMode,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation("common");
  const [rowSelection, setRowSelection] = useState({});
  const { activeRowId, setActiveRowId } = useActiveRow(
    "scan-items-action-table"
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    enableMultiRowSelection: !attachmentId, // Disable multi-selection when in attachment mode
  });

  const rowSelected = table.getFilteredSelectedRowModel().rows;

  const handleAttach = () => {
    if (onAttach) {
      onAttach(rowSelected, () => setRowSelection({}));
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(rowSelected, () => setRowSelection({}));
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="h-full flex flex-col">
      {/* Attach Mode Banner */}
      {attachmentId && attachmentMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 mb-2">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900">
              {attachmentMode.title}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {attachmentMode.description}
            </p>
          </div>
        </div>
      )}
      <ScanItemsActionFilterTable
        onDelete={() => handleDelete()}
        selected={rowSelected.length}
        isDisabled={!rowSelected.length}
        onSearch={onSearch}
        attachmentId={attachmentId}
        onAttach={attachmentId && onAttach ? () => handleAttach() : undefined}
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
