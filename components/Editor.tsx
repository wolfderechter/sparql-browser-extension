import { useEffect, useRef } from "react";
import { createSparqlEditor } from "sparql-editor";
import { db } from "@/data/db";
import { useDebouncedCallback } from "use-debounce";
import { useLiveQuery } from "dexie-react-hooks";

// Define the type for the editor instance (adjust based on sparql-editor's actual return type)
interface SparqlEditorView {
  destroy: () => void;
}

function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<SparqlEditorView | null>(null);

  const file = useLiveQuery(() => db.files.where({ focused: 1 }).first());

  const debouncedUpdate = useDebouncedCallback((value: string) => {
    if (file?.id) {
      db.files.update(file.id, {
        code: value,
        modified: new Date()
      });
    }
  }, 500);

  useEffect(() => {
    // Only initialize if we have a file and a container
    if (!file || !containerRef.current) return;

    // Create the editor
    const view = createSparqlEditor({
      parent: containerRef.current,
      value: file.code,
      onChange: (val: string) => debouncedUpdate(val),
    });

    editorRef.current = view;

    // Cleanup function: This runs automatically when the file ID changes or component unmounts
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [file?.id]); // Re-run only when the actual file changes

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50/50">
        <div className="text-center text-gray-400">
          <i className="ri-braces-line text-5xl mb-2 block"></i>
          <p className="text-sm font-medium">Select a query to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white overflow-auto">
      <div ref={containerRef} className="h-full w-full text-base" />
    </div>
  );
}

export default Editor;
