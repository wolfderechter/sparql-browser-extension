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

  const columns = [
    {
      id: "ID",
      header: "ID",
      enableResizing: false,
      cell: ({ row }: any) => row.index + 1,
    },
    ...data.head.vars.map((variable: string) => ({
      id: variable,
      header: variable,
      enableResizing: true,
      accessorFn: (row: any) => row[variable],
      cell: ({ getValue }: any) => {
        const val = getValue();
        if (!val) return null;
        if (!val.shortened) return <div>{val.uri}</div>;
        return <CustomCell value={val} />;
      },
    }))
  ];

  const bindings = data.results?.bindings || [];
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
