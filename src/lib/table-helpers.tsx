import { Checkbox } from "@/components/ui/checkbox";
import { Row, Table } from "@tanstack/react-table";
import { MouseEvent } from "react";

/**
 * Get a range of rows between two row IDs
 */
const getRowRange = <T,>(
  rows: Row<T>[],
  currentID: number,
  selectedID: number
): Row<T>[] => {
  const rangeStart = selectedID > currentID ? currentID : selectedID;
  const rangeEnd = rangeStart === currentID ? selectedID : currentID;
  return rows.slice(rangeStart, rangeEnd + 1);
};

/**
 * Creates a checkbox cell with Shift+Click range selection support
 * The lastSelectedID is tracked in a closure, no need for table meta
 *
 * @example
 * ```tsx
 * const columns = [
 *   {
 *     id: "select",
 *     header: ({ table }) => (
 *       <Checkbox
 *         checked={table.getIsAllPageRowsSelected()}
 *         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
 *       />
 *     ),
 *     cell: createRangeSelectableCheckboxCell(),
 *   },
 *   // ... other columns
 * ];
 * ```
 */
export const createRangeSelectableCheckboxCell = <TData,>() => {
  let lastSelectedID: string | null = null;

  const RangeSelectableCheckbox = ({
    row,
    table,
  }: {
    row: Row<TData>;
    table: Table<TData>;
  }) => {
    return (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          if (e.shiftKey && lastSelectedID) {
            const { rows, rowsById } = table.getRowModel();
            const rowsToToggle = getRowRange(
              rows,
              Number(row.id),
              Number(lastSelectedID)
            );
            const isCellSelected = rowsById[row.id].getIsSelected();
            rowsToToggle.forEach((_row) =>
              _row.toggleSelected(!isCellSelected)
            );
          } else {
            row.toggleSelected();
          }

          lastSelectedID = row.id;
        }}
        aria-label="Select row"
      />
    );
  };

  RangeSelectableCheckbox.displayName = "RangeSelectableCheckbox";

  return RangeSelectableCheckbox;
};
