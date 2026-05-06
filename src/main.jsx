import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";

import "./index.css";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import App from "./App2.jsx";

const modules = [AllCommunityModule];

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AgGridProvider modules={modules}>
      <App />
    </AgGridProvider>
  </StrictMode>,
);
