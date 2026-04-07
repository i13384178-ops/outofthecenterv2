import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

if (import.meta.env.PROD && typeof window !== "undefined" && window.location.protocol === "file:") {
  console.warn(
    "[Camp Tracker] Firebase needs http(s). Serve the dist folder (e.g. npm run preview), do not open index.html as a file."
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
