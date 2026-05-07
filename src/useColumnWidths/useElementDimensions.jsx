import { useCallback, useState, useRef } from "react";

import { useEventListener } from "./useEventListener";

export const useElementDimensions = () => {
  const ref = useRef(null);
  const [dimensions, setDimensions] = useState(null);

  const refresh = useCallback(() => {
    const domRect = ref.current?.getBoundingClientRect();

    if (domRect) {
      setDimensions(domRect);
    }
  }, []);

  useEventListener("resize", refresh);
  useEventListener("scroll", refresh, true);

  return { dimensions, refresh, ref };
};
