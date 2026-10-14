import { useCallback, useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const initial = resolveValue(initialValue);

    try {
      const stored = window.localStorage.getItem(key);

      return stored !== null ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  const reset = useCallback(() => setValue(resolveValue(initialValue)), [initialValue]);
  return [value, setValue, reset];
}

const resolveValue = (value) =>
  typeof value === "function" ? value() : value;