import { useEffect, useState } from "react";

export default function usePromise(promise) {
  const [result, setResult] = useState({ promise: null, value: null });

  useEffect(() => {
    if (!promise) return;

    let ignore = false;

    promise.then((value) => {
      if (!ignore) setResult({ promise, value });
    });

    return () => {
      ignore = true;
    };
  }, [promise]);

  return result.promise === promise ? result.value : null;
}
