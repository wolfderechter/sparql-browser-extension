import React, { useRef } from "react";
import SbFiles from "./Sidebar/SbFiles";
import SbDatabases from "./Sidebar/SbDatabases";
import { db } from "@/data/db";
import { importDB, exportDB } from "dexie-export-import";
import { StaticImportOptions } from "dexie-export-import/dist/import";

function Sidebar() {
  // 1. Use a Ref for the file input instead of getElementById
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('🔄 Importing database...');
      // Dexie-export-import clears tables if specified
      await importDB(file, {
        clearTablesBeforeImport: true,
        overwriteValues: true
      } as StaticImportOptions);

      window.location.reload();
    } catch (err) {
      console.error('❌ Import failed:', err);
      alert('Failed to import database. Ensure the file is a valid Dexie export.');
    } finally {
      // Clear the input value so the same file can be imported twice if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await exportDB(db);
      const jsonObjectUrl = URL.createObjectURL(blob);

      const anchorEl = document.createElement("a");
      anchorEl.href = jsonObjectUrl;
      anchorEl.download = `sparql-extension-export-${new Date().toISOString().slice(0, 10)}.json`;

      anchorEl.click();
      URL.revokeObjectURL(jsonObjectUrl);
    } catch (err) {
      console.error('❌ Export failed:', err);
    }
  };

  return (
    <div className="flex h-full w-60 flex-col border-r border-gray-300 bg-gray-100 text-gray-800 shadow-inner">
      <SbDatabases />
      <SbFiles />
      <div className="flex flex-col space-y-2 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-around">
          <a
            href="https://github.com/wolfderechter/sparql-browser-extension"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
          >
            <i className="ri-github-fill text-2xl text-gray-500 hover:text-gray-900 transition-colors" />
          </a>

          <button
            onClick={handleImportClick}
            className="text-xs font-medium uppercase tracking-wider text-gray-600 hover:text-blue-600 transition-colors"
          >
            Import
          </button>

          <button
            onClick={handleExportData}
            className="text-xs font-medium uppercase tracking-wider text-gray-600 hover:text-blue-600 transition-colors"
          >
            Export
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        hidden
        onChange={handleFileChange}
      />
    </div>
  );
}

export default Sidebar;
