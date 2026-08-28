import {
  createRequires,
  createUseRemoteComponent,
} from "@paciolan/remote-component";
import * as React from "react";
import * as ReactDOM from "react-dom";

import RemoteComponentContext from "./RemoteComponentContext";

const useRemoteComponentLoader = createUseRemoteComponent({
  requires: createRequires({
    react: React,
    "react-dom": ReactDOM,
  }),
});

export default function RemoteComponentProvider({ children, url }) {
  const [loading, error, Component] = useRemoteComponentLoader(url);

  if (loading) {
    return <div>Loading Wrapper…</div>;
  }

  if (error != null) {
    return <div>Unable to load Wrapper: {error.toString()}</div>;
  }

  return (
    <RemoteComponentContext value={Component}>
      {children}
    </RemoteComponentContext>
  );
}
