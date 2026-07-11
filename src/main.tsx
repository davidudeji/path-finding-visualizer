import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Import Bootstrap CSS and JS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import App from "./App.tsx";
import { ParamsProvider } from "../context/context.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ParamsProvider>
      <App />
    </ParamsProvider>
  </StrictMode>,
);
