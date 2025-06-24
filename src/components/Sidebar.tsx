import React from "react"
import SbFiles from "./Sidebar/SbFiles"
import SbDatabases from "./Sidebar/SbDatabases"
import SbFavorites from "./Sidebar/SbFavorites"
import { db } from "../data/db";
import { importDB, exportDB } from "dexie-export-import";

function Sidebar() {
  const importData = async () => {
    const importInput = document.getElementById('fileid');
    importInput.click();

    async function handleFileChange(event) {
      const file = event.target.files[0];

      if (file) {
        console.log('Importing file:', file.name);
        // Import the database from the file blob
        const db = await importDB(file, { clearTablesBeforeImport: true });

        console.log('Database imported successfully:', db);
      }
      importInput.removeEventListener('change', handleFileChange)
    }

    importInput.addEventListener('change', handleFileChange);
  };

  const exportData = async () => {
    const blob = await exportDB(db);
    const jsonObjectUrl = URL.createObjectURL(blob);
    const filename = "example.json";
    const anchorEl = document.createElement("a");
    anchorEl.href = jsonObjectUrl;
    anchorEl.download = filename;

    anchorEl.click();

    URL.revokeObjectURL(jsonObjectUrl);
  }

  return (
    <div className="flex h-full w-60 flex-col border-r border-gray-300 bg-gray-100 text-gray-800">
      <SbDatabases />
      <SbFiles />
      <SbFavorites />
      <div className="flex-1" />
      <div className="flex w-[80%] justify-around">
        <a
          href="https://github.com/aatauil/sparql-browser-extension"
          target="_blank"
          rel="noopener noreferrer">
          <i className="ri-github-fill text-2xl text-gray-800 hover:text-gray-600" />
        </a>
        <button onClick={importData}>import</button>
        <button onClick={exportData}>export</button>
      </div>
      <input id='fileid' type='file' hidden />
    </div>
  )
}

export default Sidebar
