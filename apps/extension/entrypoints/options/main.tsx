import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Options } from "./Options";

const root = document.querySelector("#root");
if (!(root instanceof HTMLElement)) {
  throw new Error("Options root is missing");
}

createRoot(root).render(
  <StrictMode>
    <Options />
  </StrictMode>,
);
