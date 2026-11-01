import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

try {
  document.documentElement.dataset.theme =
    localStorage.getItem("dealancer-theme") || "light";
} catch {
  /* Keep the default theme when storage is unavailable. */
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
