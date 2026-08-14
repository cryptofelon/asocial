import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "./Popup";

const root = document.querySelector("#root");
if (!(root instanceof HTMLElement)) {
  throw new Error("Popup root is missing");
}

createRoot(root).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
