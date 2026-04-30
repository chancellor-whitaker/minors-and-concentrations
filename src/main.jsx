import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App2.jsx";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";

const modules = [AllCommunityModule];

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AgGridProvider modules={modules}>
      <App />
    </AgGridProvider>
  </StrictMode>,
);
