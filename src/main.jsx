import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";

import "./index.css";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import App from "./App.jsx";

const modules = [AllCommunityModule];
import { RemoteComponentProvider, getWrapperRemoteUrl } from "./remote";

const wrapperUrl = getWrapperRemoteUrl();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RemoteComponentProvider url={wrapperUrl}>
      <AgGridProvider modules={modules}>
        <App />
      </AgGridProvider>
    </RemoteComponentProvider>
  </StrictMode>,
);
