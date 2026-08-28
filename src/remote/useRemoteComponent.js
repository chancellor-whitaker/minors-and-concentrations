import { useContext } from "react";

import RemoteComponentContext from "./RemoteComponentContext";

/**
 * Returns the already-loaded Wrapper remote component from context.
 *
 * The provider owns the asynchronous loading step. Consumer components use
 * this hook so they can treat the remote Wrapper like a normal shared React
 * dependency and access both the component and its attached API members.
 */
export default function useRemoteComponent() {
  const component = useContext(RemoteComponentContext);

  if (component == null) {
    throw new Error(
      "useRemoteComponent must be used inside <RemoteComponentProvider>.",
    );
  }

  return component;
}
