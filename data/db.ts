import Dexie, { type Table } from "dexie";

// 1. Define the "Shape" of your data for TypeScript
export interface DatabaseRecord {
  id?: number;
  name: string;
  focused: number;
  created: Date;
}

export interface SparqlOutput {
  boolean?: boolean;
  head?: { vars: string[] };
  results?: {
    bindings: Array<Record<string, { value: string; type: string }>>;
  };
}

export interface FileRecord {
  id?: number;
  name: string;
  databaseId: number;
  focused: number;
  code: string;
  output: SparqlOutput | null;
  created: Date;
  modified: Date;
  status: string;
  statusMessage: string;
  errorMessage: string;
  isLoading: boolean;
  duration: string;
  queriedAt: Date | null;
}

export interface FileListItemProps {
  file: FileRecord;
}
export interface FileProps {
  data: FileRecord;
}
export interface EndpointRecord {
  id?: number;
  value: string;
  label: string;
  focused: number;
}

// Use "!" to tell TS these will be assigned by Dexie
export class MyDexie extends Dexie {
  databases!: Table<DatabaseRecord>;
  files!: Table<FileRecord>;
  endpoints!: Table<EndpointRecord>;

  constructor() {
    super("sparqlBrowserExtensionDB");

    this.version(1).stores({
      databases: "++id, name, focused, created",
      files: "++id, name, databaseId, focused, code, output, created, modified, status, statusMessage, errorMessage, isLoading, duration",
      endpoints: "++id, value, label, focused",
    });
  }
}

export const db = new MyDexie();

db.open()
  .then(() => console.log("DB initialized"))
  .catch((err) => console.error("DB error", err));
