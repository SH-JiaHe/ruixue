import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./travel/App";
import "./travel/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
