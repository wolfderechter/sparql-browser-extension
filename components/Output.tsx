import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/data/db";
import Spinner from "./ui/Spinner";
import { parseForGrid } from "@/utils/parse-for-grid";
import {
  tableFeatures,
  useTable,
  createSortedRowModel,
  rowSortingFeature,
  columnSizingFeature,
  columnResizingFeature,
  sortFns,
  flexRender,
} from "@tanstack/react-table";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnSizingFeature,
  columnResizingFeature,
  sortFns,
});

function Output() {
  const file = useLiveQuery(() => db.files.where({ focused: 1 }).first());

  if (!file) return <EmptyStateOutput />;

  return (
    <div className="flex h-full flex-col border-t border-gray-200 bg-gray-100">
      <OutputToolbar file={file} />
      <div className="relative flex-1 min-h-0">
        <OutputZone file={file} />
      </div>
    </div>
  );
}

function OutputToolbar({ file }: any) {
  const statusColor = () => {
    if (file?.status == 200)
      return "bg-green-700 text-white font-medium border-green-900";
    return "bg-red-700 border-red-900";
  };

  return (
    <div className="flex items-center space-x-2 p-2">
      {file.isLoading ? (
        <Spinner />
      ) : (
        <div
          className={`rounded border border-gray-400 px-2 py-1 text-[11px] font-medium text-white ${statusColor()}`}>
          {file?.status} {file?.statusMessage}
        </div>
      )}

      {file.duration && (
        <div className="rounded border border-gray-400 bg-white px-2 py-1 text-[11px] font-medium text-gray-700">
          {file.duration}
        </div>
      )}
    </div>
  );
}

function OutputZone({ file }: any) {
  const { columns, rows } = useMemo(
    () => parseForGrid(file.output),
    [file.output]
  );

  const table = useTable({
    columns,
    data: rows,
    features,
    columnResizeMode: "onChange",
  });

  if (file.isLoading) return null;

  if (file.errorMessage) {
    return (
      <div className="h-full p-2">
        <div className="mt-2 whitespace-pre-line rounded bg-gray-200 p-4 font-medium text-gray-800">
          {file.errorMessage}
        </div>
      </div>
    );
  }

  const { rows: tableRows } = table.getRowModel();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto relative">
        <table
          className="table-fixed border-collapse text-left text-sm"
          style={{ width: table.getTotalSize() }}
        >
          <thead className="sticky top-0 z-10 bg-gray-200 shadow-sm">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="group relative border-b border-gray-300 px-2 py-1 text-left font-medium select-none truncate"
                    style={{ width: header.getSize() }}
                  >
                    {/* Sorting Click Target */}
                    <div
                      className={header.column.getCanSort() ? "cursor-pointer" : ""}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? null}
                    </div>

                    {/* Resize Handle */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none bg-gray-400 opacity-0 transition-opacity hover:bg-blue-500 group-hover:opacity-100 ${header.column.getIsResizing() ? "bg-blue-500 opacity-100" : ""
                          }`}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                {row.getAllCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-2 py-1 text-left truncate overflow-hidden"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function EmptyStateOutput() {
  return (
    <div className="h-full border-t border-gray-200 bg-gray-100">
      <div className="h-full p-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-200">
            status
          </div>
          <div className="font-medium text-gray-700">Results</div>
        </div>

        <div className="flex h-full items-center justify-center text-center">
          <div className="text-gray-500">
            <i className="ri-rainbow-line text-4xl"></i>
            <div>The results of your query will appear here.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Output;
