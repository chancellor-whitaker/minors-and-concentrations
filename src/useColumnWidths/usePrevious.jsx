import { useState } from "react";

export const usePrevious = (value, response) => {
  const [prevValue, setPrevValue] = useState(value);

  if (prevValue !== value) {
    setPrevValue(value);

    typeof response === "function" && response(prevValue);
  }

  return prevValue;
};
