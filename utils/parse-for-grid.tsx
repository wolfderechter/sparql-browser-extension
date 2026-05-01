import CustomCell from "@/components/ui/CustomCell";
import { prefixes } from "@/data/prefixes";

const sortedPrefixes = Object.entries(prefixes).sort(
  (a, b) => b[1].length - a[1].length
);

function findShortened(value: any) {
  for (const [short, long] of sortedPrefixes) {
    if (value.startsWith(long)) {
      return value.replace(long, `${short}:`);
    }
  }
  return null;
}

export function parseForGrid(data: any) {
  if (!data) {
    return { columns: [], rows: [] };
  }

  if ("boolean" in data) {
    return {
      columns: [{
        id: "ASK",
        header: "ASK",
        accessorKey: "ASK",
        cell: ({ getValue }: any) => String(getValue()),
      }],
      rows: [{ ASK: data.boolean }]
    };
  }

  const bindings = data.results?.bindings || [];

  // 1. Pre-calculate the maximum text length for each column
  const maxLengths: Record<string, number> = {};

  // Initialize with the length of the headers
  data.head.vars.forEach((variable: string) => {
    maxLengths[variable] = variable.length;
  });

  // Scan the first 50 rows to find the longest content
  // (Scanning 50 is fast, scanning all 500 might slow down the render slightly)
  const sampleRows = bindings.slice(0, 50);
  sampleRows.forEach((row: any) => {
    data.head.vars.forEach((variable: string) => {
      const rawValue = row[variable]?.value || "";
      // Make sure we measure the shortened version if it exists!
      const displayValue = findShortened(rawValue) || rawValue;

      if (displayValue.length > maxLengths[variable]) {
        maxLengths[variable] = displayValue.length;
      }
    });
  });

  // 2. Generate columns with dynamically calculated sizes
  const columns = [
    {
      id: "ID",
      header: "ID",
      size: 50,
      enableResizing: false,
      cell: ({ row }: any) => row.index + 1,
    },
    ...data.head.vars.map((variable: string) => {
      // Rough math: ~8px per character + 32px for cell padding
      const estimatedPixels = (maxLengths[variable] * 8) + 32;

      // Constrain to sensible limits (e.g., between 80px and 400px)
      const calculatedSize = Math.min(Math.max(estimatedPixels, 80), 650);

      return {
        id: variable,
        header: variable,
        enableResizing: true,
        size: calculatedSize,
        accessorFn: (row: any) => row[variable],
        cell: ({ getValue }: any) => {
          const val = getValue();
          if (!val) return null;
          if (!val.shortened) return <div className="truncate">{val.uri}</div>;
          return <CustomCell value={val} />;
        },
      };
    })
  ];

  const rows = bindings.slice(0, 500).map((row: any, index: number) => {
    const newRow: any = { ID: index + 1 };

    for (const [key, valueObj] of Object.entries(row)) {
      const value = (valueObj as any)?.value;
      let shortened = null;
      if ((valueObj as any)?.type === "uri") {
        shortened = findShortened(value);
      }
      newRow[key] = { uri: value, shortened };
    }

    return newRow;
  });
  return { columns, rows };
}
