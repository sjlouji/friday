import { useEffect, useRef, useState } from "react";

export function useAutoSave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  delay: number = 500
): { isSaving: boolean; error: Error | null } {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<T>(value);

  useEffect(() => {
    if (JSON.stringify(value) === JSON.stringify(previousValueRef.current)) {
      return;
    }

    previousValueRef.current = value;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      setError(null);
      try {
        await saveFn(value);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, saveFn, delay]);

  return { isSaving, error };
}

