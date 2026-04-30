import { useState } from "react";

export default function usePrevious(value, fn) {
  const [prevValue, setPrevValue] = useState(value);

  if (prevValue !== value) {
    setPrevValue(value);

    typeof fn === "function" && fn(prevValue);
  }

  return prevValue;
}
