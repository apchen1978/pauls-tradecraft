import React from "react";
import { createRoot } from "react-dom/client";
// Geist 字型已透過 index.css 的 @font-face 只載 latin 子集
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
