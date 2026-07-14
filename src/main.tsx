import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ParamsProvider } from "../context/context.tsx";

<<<<<<< HEAD
=======
import { ParamsProvider } from "../context/context";

>>>>>>> 9b47e8f8e8d4348f06eb1b2364e334df9a7c3d8e
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ParamsProvider>
      <App />
    </ParamsProvider>
  </StrictMode>,
);
