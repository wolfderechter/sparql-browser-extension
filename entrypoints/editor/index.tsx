import React from "react";
import { createRoot, type Root } from "react-dom/client";
import "@/assets/style.css";
import "react-split-pane/styles.css";
import Editor from "@/components/Editor";
import Output from "@/components/Output";
import SideBar from "@/components/Sidebar";
import Toolbar from "@/components/Toolbar";
import { SplitPane, Pane } from "react-split-pane";

const EditorApp = () => {
  return (
    <div>
      <div className="max-w-screen h-screen max-h-screen w-screen overflow-hidden bg-white">
        <div className="flex h-full w-full">
          <SideBar />
          <div className="relative flex h-full flex-1 flex-col overflow-hidden">
            <SplitPane
              className="h-full"
              direction="vertical">
              <Pane className="overflow-hidden" defaultSize="50%" minSize={80}>
                <div className="flex h-full flex-col">
                  <Toolbar />
                  <div className="flex-1 min-h-0">
                    <Editor />
                  </div>
                </div>
              </Pane>
              <Pane className="overflow-hidden" minSize={80}>
                <Output />
              </Pane>
            </SplitPane>
          </div>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById("root") as HTMLDivElement & {
  _root?: Root;
};
const root = container._root ?? (container._root = createRoot(container));
root.render(
  <React.StrictMode>
    <EditorApp />
  </React.StrictMode>
);
