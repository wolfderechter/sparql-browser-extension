import CustomCell from "@/components/ui/CustomCell";
import { prefixes } from "@/data/prefixes";
import type { SparqlOutput } from "@/data/db";
import {
  createColumnHelper,
  tableFeatures,
  createSortedRowModel,
  rowSortingFeature,
  columnSizingFeature,
  columnResizingFeature,
  sortFns,
  type ColumnDef,
} from "@tanstack/react-table";

export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnSizingFeature,
  columnResizingFeature,
  sortFns,
});

export interface GridCell {
  uri: string;
  shortened: string | null;
}

export interface GridRow {
  ID?: number;
  [key: string]: GridCell | number | boolean | undefined;
}

const columnHelper = createColumnHelper<typeof features, GridRow>();

const sortedPrefixes = Object.entries(prefixes).sort(
  (a, b) => b[1].length - a[1].length
);

function findShortened(value: string) {
  for (const [short, long] of sortedPrefixes) {
    if (value.startsWith(long)) {
      return value.replace(long, `${short}:`);
    }
  }
  return null;
}

function valueCell({ getValue }: { getValue: () => unknown }) {
  const val = getValue();
  if (!val) return null;
  if (typeof val !== "object") return <div className="truncate">{String(val)}</div>;
  const gridCell = val as GridCell;
  if (!gridCell.shortened) return <div className="truncate">{gridCell.uri}</div>;
  return <CustomCell value={gridCell} />;
}

export function parseForGrid(data: SparqlOutput | null): {
  columns: ColumnDef<typeof features, GridRow, any>[];
  rows: GridRow[];
} {
  if (!data) {
    return { columns: columnHelper.columns([]), rows: [] };
  }

  if (data.boolean !== undefined) {
    return {
      columns: columnHelper.columns([
        columnHelper.accessor((row) => row.ASK, {
          id: "ASK",
          header: "ASK",
          cell: ({ getValue }) => String(getValue()),
        }),
      ]),
      rows: [{ ASK: data.boolean }],
    };
  }

  const bindings = data.results?.bindings || [];
  const vars = data.head?.vars ?? [];

  // 1. Pre-calculate the maximum text length for each column
  const maxLengths: Record<string, number> = {};

  // Initialize with the length of the headers
  vars.forEach((variable: string) => {
    maxLengths[variable] = variable.length;
  });

  // Scan the first 50 rows to find the longest content
  // (Scanning 50 is fast, scanning all 500 might slow down the render slightly)
  const sampleRows = bindings.slice(0, 50);
  sampleRows.forEach((row) => {
    vars.forEach((variable: string) => {
      const rawValue = row[variable]?.value || "";
      // Make sure we measure the shortened version if it exists!
      const displayValue = findShortened(rawValue) || rawValue;

      if (displayValue.length > maxLengths[variable]) {
        maxLengths[variable] = displayValue.length;
      }
    });
  });

  // 2. Generate columns with dynamically calculated sizes
  const columns = columnHelper.columns([
    columnHelper.display({
      id: "ID",
      header: "ID",
      size: 50,
      enableResizing: false,
      cell: ({ row }) => row.index + 1,
    }),
    ...vars.map((variable: string) => {
      // Rough math: ~8px per character + 32px for cell padding
      const estimatedPixels = maxLengths[variable] * 8 + 32;

      // Constrain to sensible limits (e.g., between 80px and 650px)
      const calculatedSize = Math.min(Math.max(estimatedPixels, 80), 650);

      return columnHelper.accessor((row) => row[variable], {
        id: variable,
        header: variable,
        enableResizing: true,
        size: calculatedSize,
        cell: valueCell,
      });
    }),
  ]);

  const rows: GridRow[] = bindings.slice(0, 500).map((row, index) => {
    const newRow: GridRow = { ID: index + 1 };

    for (const [key, valueObj] of Object.entries(row)) {
      const value = valueObj?.value ?? "";
      let shortened: string | null = null;
      if (valueObj?.type === "uri") {
        shortened = findShortened(value);
      }
      newRow[key] = { uri: value, shortened };
    }

    return newRow;
  });

  return { columns, rows };
}
