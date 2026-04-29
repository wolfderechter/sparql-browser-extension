import CustomCell from "@/components/ui/CustomCell";
import { prefixes } from "@/data/prefixes";

const sortedPrefixes = Object.entries(prefixes).sort(
  (a, b) => b[0].length - a[0].length
);

function findShortened(value) {
  for (const [long, short] of sortedPrefixes) {
    if (value.startsWith(long)) {
      return value.replace(long, `${short}:`);
    }
  }
  return null;
}

export function parseForGrid(data) {
  if (!data) {
    return { columns: [], rows: [] };
  }

  if ("boolean" in data) {
    return { columns: [{ field: "ASK" }], rows: [{ ASK: data.boolean }] };
  }

  const columns = [
    {
      field: "ID",
      resizable: false,
      sortable: true,
      pinned: "left",
      width: "60px"
    },
    ...data.head.vars.map((variable) => ({
      field: variable,
      resizable: true,
      sortable: true,
      cellRenderer: CustomCell
    }))
  ];

  const bindings = data.results?.bindings || [];
  const rows = bindings.slice(0, 500).map((row, index) => {
    const newRow = { ID: index + 1 };

    for (const [key, valueObj] of Object.entries(row)) {
      const value = valueObj?.value;
      let shortened = null;
      if (valueObj?.type === "uri") {
        shortened = findShortened(value);
      }
      newRow[key] = { uri: value, shortened };
    }

    return newRow;
  });
  return { columns, rows };
}
