import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MentorsPage from "../MentorsPage";
import "../index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container #root was not found in mentors/index.html");
}

createRoot(container).render(
  <StrictMode>
    <MentorsPage />
  </StrictMode>,
);
