import { useEffect, useRef } from "react";
import { useBeancountStore } from "@/store/beancountStore";
import { useSettings } from "@/hooks/useSettings";

export function useBeancountData() {
  const { beancountFilePath, initialized: settingsInitialized } = useSettings();
  const { loadAll, loading, error } = useBeancountStore();
  const lastFilePathRef = useRef<string>("");
  const hasLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!settingsInitialized) {
      return;
    }

    if (!beancountFilePath || !beancountFilePath.trim()) {
      return;
    }

    if (
      beancountFilePath === lastFilePathRef.current &&
      hasLoadedRef.current
    ) {
      return;
    }

    const loadData = async () => {
      try {
        lastFilePathRef.current = beancountFilePath;
        hasLoadedRef.current = false;
        await loadAll();
        hasLoadedRef.current = true;
      } catch (err) {
        console.error("Failed to load beancount data:", err);
        hasLoadedRef.current = false;
      }
    };

    loadData();
  }, [beancountFilePath, settingsInitialized, loadAll]);

  return {
    loading,
    error,
    filePath: beancountFilePath,
    isReady: hasLoadedRef.current && !!beancountFilePath,
  };
}

