import React from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "./App.tsx";
import "@/assets/style.css";

const container = document.getElementById("root") as HTMLDivElement & {
  _root?: Root;
};
const root = container._root ?? (container._root = createRoot(container));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
