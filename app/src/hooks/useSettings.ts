import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import type {
  AppSettings,
  AppearanceSettings,
  WorkspaceSettings,
  BookkeepingSettings,
  TablePreferences,
} from "@/store/settingsStore";

export function useSettings() {
  const store = useSettingsStore();

  useEffect(() => {
    if (!store.initialized) {
      store.initialize();
    }
  }, [store]);

  return {
    settings: store.settings,
    appearance: store.settings.appearance,
    workspace: store.settings.workspace,
    bookkeeping: store.settings.bookkeeping,
    tablePreferences: store.settings.appearance.tablePreferences,
    beancountFilePath: store.settings.beancountFilePath,
    initialized: store.initialized,
    updateAppearance: store.updateAppearance,
    updateWorkspace: store.updateWorkspace,
    updateBookkeeping: store.updateBookkeeping,
    updateTablePreferences: store.updateTablePreferences,
    updateSettings: store.updateSettings,
    resetSettings: store.resetSettings,
    applyTheme: store.applyTheme,
    applyLanguage: store.applyLanguage,
  };
}

export type {
  AppSettings,
  AppearanceSettings,
  WorkspaceSettings,
  BookkeepingSettings,
  TablePreferences,
};

