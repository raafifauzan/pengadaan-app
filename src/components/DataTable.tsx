import { ChevronsUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TableColumnConfig } from "@/config/table";
import type { ReactNode } from "react";

export type DataTableSortConfig<Key extends string> = {
  key: Key;
  direction: "asc" | "desc";
};

interface DataTableProps<Row, Key extends string> {
  columns: TableColumnConfig<Key>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string | number;
  renderCell: (row: Row, columnKey: Key) => ReactNode;
  sortConfig?: DataTableSortConfig<Key>;
  onSortChange?: (column: TableColumnConfig<Key>) => void;
  emptyMessage?: string;
  tableClassName?: string;
  rowClassName?: string;
  onRowDoubleClick?: (row: Row) => void;
}

export function DataTable<Row, Key extends string>({
  columns,
  rows,
  rowKey,
  renderCell,
  sortConfig,
  onSortChange,
  emptyMessage = "Tidak ada data.",
  tableClassName,
  rowClassName = "hover:bg-muted/40 transition-colors border-b",
  onRowDoubleClick,
}: DataTableProps<Row, Key>) {
  return (
    <Table className={cn("w-full", tableClassName)}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => {
            const alignClass = column.align ?? "";
            const justifyClass =
              column.justify ??
              (alignClass.includes("text-right")
                ? "justify-end"
                : alignClass.includes("text-center")
                ? "justify-center"
                : "justify-start");
            const widthStyle = {
              width: column.basis ?? column.width,
              minWidth: column.minWidth ?? column.basis ?? column.width,
            };

            return (
              <TableHead
                key={column.key}
                      className={cn(column.headPadding ?? "px-6", "py-2 text-sm font-semibold text-muted-foreground", alignClass)}
                      style={widthStyle}
                    >
                      {column.sortable ? (
                        <button
                    type="button"
                    onClick={() => onSortChange?.(column)}
                    className={cn("flex w-full items-center gap-1", justifyClass)}
                  >
                    {column.label}
                          <ChevronsUpDown
                            className={cn(
                              "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                              sortConfig?.key === column.key ? "opacity-100" : "opacity-60"
                            )}
                          />
                      </button>
                    ) : (
                      <span className={cn("flex w-full", justifyClass)}>{column.label}</span>
                    )}
                  </TableHead>
                );
              })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={columns.length} className="px-4 py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}

        {rows.map((row, index) => (
          <TableRow
            key={rowKey(row, index)}
            className={cn(rowClassName, onRowDoubleClick && "cursor-pointer")}
            onDoubleClick={() => onRowDoubleClick?.(row)}
          >
            {columns.map((column) => {
              const alignClass = column.align ?? "";
              const justifyClass =
                column.justify ??
                (alignClass.includes("text-right")
                  ? "justify-end"
                  : alignClass.includes("text-center")
                  ? "justify-center"
                  : "justify-start");
              const widthStyle = {
                width: column.basis ?? column.width,
                minWidth: column.minWidth ?? column.basis ?? column.width,
              };

              return (
                <TableCell
                  key={column.key}
                  className={cn(column.cellPadding ?? "px-6", "py-2 text-sm align-middle", alignClass)}
                  style={widthStyle}
                >
                  <div className={cn("flex w-full", justifyClass)}>{renderCell(row, column.key)}</div>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
