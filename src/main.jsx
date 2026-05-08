import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";

import "./index.css";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { RemoteComponent } from "./components/RemoteComponent.jsx";
import App from "./App2.jsx";

const modules = [AllCommunityModule];

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RemoteComponent
      url="https://irserver2.eku.edu/libraries/remote/r19-wrapper.cjs"
      heading="Minors & Concentrations"
    >
      <AgGridProvider modules={modules}>
        <App />
      </AgGridProvider>
    </RemoteComponent>
  </StrictMode>,
);
