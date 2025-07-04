import React, { useRef, useState } from "react";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import { db } from "../../data/db";
import { useLiveQuery } from "dexie-react-hooks";

function SbDatabases() {
  const dbInput = useRef();

  const [selectedDb, setSelectedDb] = useState(false);
  const [isCreatingDb, setIsCreatingDb] = useState(false);
  const [dbName, setDbName] = useState("");

  const databases = useLiveQuery(() => db.databases.toArray());

  useOnClickOutside(dbInput, () => {
    setIsCreatingDb(false);
  });

  async function addDatabase() {
    const now = new Date();

    db.databases.where("focused").equals(1).modify({ focused: 0 });
    db.files.where("focused").equals(1).modify({ focused: 0 });

    db.databases.add({
      name: dbName,
      focused: 1,
      created: now
    });
  }

  function setDatabase(database) {
    if (database.focused == 1) return;

    db.databases.where("focused").equals(1).modify({ focused: 0 });
    db.files.where("focused").equals(1).modify({ focused: 0 });

    db.databases.update(database, { focused: 1 });
  }

  async function deleteDatabase() {
    await db.files.where({ databaseId: selectedDb.id }).delete();
    await db.databases.where({ id: selectedDb.id }).delete();
    setSelectedDb(false);
  }

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsCreatingDb(false);
      setDbName("");
    }
    if (event.key === "Enter") {
      addDatabase();
      setIsCreatingDb(false);
      setDbName("");
    }
  };

  const isEmptyAndNotCreating = () =>
    databases?.length == 0 && isCreatingDb == false;

  return (
    <div className="relative pb-4">
      <div className="flex items-center justify-between space-x-1 bg-gray-200/50 py-2 pl-3 pr-3">
        <i className="ri-instance-line text-base leading-3 text-gray-500"></i>
        <h2 className="flex-1 text-xs font-medium uppercase text-gray-900">
          Collections
        </h2>
        <button
          className="py-.5 text-md rounded px-1 text-black hover:bg-gray-300"
          onClick={() => setIsCreatingDb(true)}>
          <i className="ri-add-line text-sm"></i>
        </button>
      </div>

      <div className='p-2 space-y-px h-[150px] overflow-auto'>
        {isCreatingDb ? (
          <div
            ref={dbInput}
            className="flex cursor-pointer items-center space-x-1 rounded border border-gray-300 bg-white p-1 text-xs">
            <i className="ri-layout-2-line text-base"></i>
            <input
              autoFocus
              type="text"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded border-none p-1 pl-0 text-xs focus:ring-0"
              placeholder="Collection name"
            />
          </div>
        ) : (
          ""
        )}

        {databases?.map((db, index) => (
          <div
            key={index}
            onClick={() => setDatabase(db)}
            className={`flex cursor-pointer items-center space-x-1 rounded border border-transparent p-1 text-xs hover:bg-gray-200 ${db.focused && "border border-gray-600 bg-white text-black ring-offset-2 hover:border-black hover:bg-white"}`}>
            <i
              className={`ri-layout-2-line text-base ${db.focused && "text-blue-700"}`}></i>
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {db.name}
            </div>
            <button className="flex h-5 w-5 items-center justify-center rounded-full text-gray-700 hover:bg-red-100 hover:text-red-500">
              <i
                className="ri-close-line"
                onClick={() => setSelectedDb(db)}></i>
            </button>
          </div>
        ))}

        {isEmptyAndNotCreating() && (
          <div className="rounded px-1 py-2 text-center text-[10px] text-gray-400">
            You can start writing queries as soon as you create a collection
          </div>
        )}
      </div>

      {selectedDb && (
        <div className="relative z-50" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div
            className="fixed inset-0 overflow-y-auto"
            onClick={() => setSelectedDb(false)}>
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div
                  className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4"
                  onClick={(e) => e.stopPropagation()}>
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 text-center sm:ml-4 sm:text-left">
                      <h3
                        className="font-base text-lg leading-6 text-gray-900"
                        id="modal-title">
                        Delete Collection{" "}
                        <span className="font-medium">{selectedDb.name}</span>
                      </h3>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">
                          Deleting this collection will also{" "}
                          <strong>delete all queries</strong> inside of it. This
                          action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-gray-50 px-2 py-3">
                  <button
                    type="button"
                    onClick={() => deleteDatabase()}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
                    Delete permanently
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDb(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SbDatabases;
