import { create } from "zustand";
import {
  AppSettings,
  AppearanceSettings,
  WorkspaceSettings,
  BookkeepingSettings,
  TablePreferences,
  DEFAULT_SETTINGS,
  DEFAULT_APPEARANCE,
  DEFAULT_WORKSPACE,
  DEFAULT_BOOKKEEPING,
} from "@/modules/settings/types";

const BEANCOUNT_FILE_KEY = "friday-beancount-file-path";
const APPEARANCE_KEY = "friday-settings-appearance";
const WORKSPACE_KEY = "friday-settings-workspace";
const BOOKKEEPING_KEY = "friday-settings-bookkeeping";
const OLD_STORAGE_KEY = "beancount-settings";
const OLD_FRIDAY_KEY = "friday-settings";

interface OldSettings {
  defaultCurrency?: string;
  dateFormat?: string;
  fiscalYearStart?: string;
  language?: string;
  locale?: string;
  theme?: string;
  timeFormat?: "12h" | "24h";
  tablePreferences?: TablePreferences;
  beancount?: {
    accountNameSeparator?: string;
    defaultAccountTypes?: {
      assets?: string;
      liabilities?: string;
      equity?: string;
      income?: string;
      expenses?: string;
    };
    defaultFlag?: string;
    defaultNarration?: string;
    useLegacyMetadata?: boolean;
  };
  [key: string]: unknown;
}

const loadAppearance = (): AppearanceSettings => {
  try {
    const saved = localStorage.getItem(APPEARANCE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_APPEARANCE,
        ...parsed,
        tablePreferences: {
          ...DEFAULT_APPEARANCE.tablePreferences,
          ...(parsed.tablePreferences || {}),
        },
      };
    }
  } catch (error) {
    console.error("Failed to load appearance settings", error);
  }
  return DEFAULT_APPEARANCE;
};

const loadWorkspace = (): WorkspaceSettings => {
  try {
    const saved = localStorage.getItem(WORKSPACE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_WORKSPACE,
        ...parsed,
      };
    }
  } catch (error) {
    console.error("Failed to load workspace settings", error);
  }
  return DEFAULT_WORKSPACE;
};

const loadBookkeeping = (): BookkeepingSettings => {
  try {
    const saved = localStorage.getItem(BOOKKEEPING_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        account: {
          ...DEFAULT_BOOKKEEPING.account,
          ...(parsed.account || {}),
          defaultAccountTypes: {
            ...DEFAULT_BOOKKEEPING.account.defaultAccountTypes,
            ...(parsed.account?.defaultAccountTypes || {}),
          },
        },
        importExport: {
          ...DEFAULT_BOOKKEEPING.importExport,
          ...(parsed.importExport || {}),
        },
        beancount: {
          ...DEFAULT_BOOKKEEPING.beancount,
          ...(parsed.beancount || {}),
        },
      };
    }
  } catch (error) {
    console.error("Failed to load bookkeeping settings", error);
  }
  return DEFAULT_BOOKKEEPING;
};

const migrateFromOldFormat = (oldSettings: OldSettings): AppSettings => {
  const migrated: AppSettings = {
    ...DEFAULT_SETTINGS,
    beancountFilePath: localStorage.getItem(BEANCOUNT_FILE_KEY) || localStorage.getItem("beancount_file_path") || "",
    appearance: {
      ...DEFAULT_APPEARANCE,
      language: oldSettings.language || DEFAULT_APPEARANCE.language,
      locale: oldSettings.locale || DEFAULT_APPEARANCE.locale,
      theme: (oldSettings.theme as "light" | "dark" | "auto") || DEFAULT_APPEARANCE.theme,
      tablePreferences: {
        ...DEFAULT_APPEARANCE.tablePreferences,
        ...(oldSettings.tablePreferences || {}),
      },
    },
    workspace: {
      ...DEFAULT_WORKSPACE,
      defaultCurrency: oldSettings.defaultCurrency || DEFAULT_WORKSPACE.defaultCurrency,
      dateFormat: oldSettings.dateFormat || DEFAULT_WORKSPACE.dateFormat,
      fiscalYearStart: oldSettings.fiscalYearStart || DEFAULT_WORKSPACE.fiscalYearStart,
      timeFormat: oldSettings.timeFormat || DEFAULT_WORKSPACE.timeFormat,
    },
  };

  if (oldSettings.beancount) {
    migrated.bookkeeping = {
      ...DEFAULT_BOOKKEEPING,
      account: {
        ...DEFAULT_BOOKKEEPING.account,
        accountNameSeparator:
          oldSettings.beancount.accountNameSeparator ||
          DEFAULT_BOOKKEEPING.account.accountNameSeparator,
        defaultAccountTypes: {
          ...DEFAULT_BOOKKEEPING.account.defaultAccountTypes,
          ...(oldSettings.beancount.defaultAccountTypes || {}),
        },
      },
      beancount: {
        ...DEFAULT_BOOKKEEPING.beancount,
        defaultFlag: oldSettings.beancount.defaultFlag || DEFAULT_BOOKKEEPING.beancount.defaultFlag,
        defaultNarration:
          oldSettings.beancount.defaultNarration || DEFAULT_BOOKKEEPING.beancount.defaultNarration,
        useLegacyMetadata: oldSettings.beancount.useLegacyMetadata || false,
      },
    };
  }

  localStorage.setItem(APPEARANCE_KEY, JSON.stringify(migrated.appearance));
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(migrated.workspace));
  localStorage.setItem(BOOKKEEPING_KEY, JSON.stringify(migrated.bookkeeping));
  localStorage.setItem(BEANCOUNT_FILE_KEY, migrated.beancountFilePath);

  return migrated;
};

const loadSettings = (): AppSettings => {
  try {
    const oldSettings = localStorage.getItem(OLD_STORAGE_KEY) || localStorage.getItem(OLD_FRIDAY_KEY);
    if (oldSettings) {
      try {
        const parsed = JSON.parse(oldSettings);
        const migrated = migrateFromOldFormat(parsed.settings || parsed);
        localStorage.removeItem(OLD_STORAGE_KEY);
        localStorage.removeItem(OLD_FRIDAY_KEY);
        localStorage.removeItem("beancount_file_path");
        return migrated;
      } catch {
        console.warn("Failed to migrate old settings");
      }
    }

    const filePath = localStorage.getItem(BEANCOUNT_FILE_KEY) || localStorage.getItem("beancount_file_path") || "";
    if (filePath && !localStorage.getItem(BEANCOUNT_FILE_KEY)) {
      localStorage.setItem(BEANCOUNT_FILE_KEY, filePath);
      localStorage.removeItem("beancount_file_path");
    }

    return {
      beancountFilePath: filePath,
      appearance: loadAppearance(),
      workspace: loadWorkspace(),
      bookkeeping: loadBookkeeping(),
    };
  } catch (error) {
    console.error("Failed to load settings", error);
    const filePath = localStorage.getItem(BEANCOUNT_FILE_KEY) || localStorage.getItem("beancount_file_path") || "";
    return {
      ...DEFAULT_SETTINGS,
      beancountFilePath: filePath,
    };
  }
};

const saveAppearance = (appearance: AppearanceSettings) => {
  try {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance));
  } catch (error) {
    console.error("Failed to save appearance settings", error);
  }
};

const saveWorkspace = (workspace: WorkspaceSettings) => {
  try {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
  } catch (error) {
    console.error("Failed to save workspace settings", error);
  }
};

const saveBookkeeping = (bookkeeping: BookkeepingSettings) => {
  try {
    localStorage.setItem(BOOKKEEPING_KEY, JSON.stringify(bookkeeping));
  } catch (error) {
    console.error("Failed to save bookkeeping settings", error);
  }
};

interface SettingsState {
  settings: AppSettings;
  initialized: boolean;
  initialize: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateAppearance: (updates: Partial<AppearanceSettings>) => void;
  updateWorkspace: (updates: Partial<WorkspaceSettings>) => void;
  updateBookkeeping: (updates: Partial<BookkeepingSettings>) => void;
  updateTablePreferences: (preferences: Partial<TablePreferences>) => void;
  resetSettings: () => void;
  applyTheme: (theme: "light" | "dark" | "auto") => void;
  applyLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;

    const loaded = loadSettings();
    set({ settings: loaded, initialized: true });

    get().applyTheme(loaded.appearance.theme);
    get().applyLanguage(loaded.appearance.language);

    if (loaded.appearance.theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleThemeChange = () => {
        get().applyTheme("auto");
      };
      mediaQuery.addEventListener("change", handleThemeChange);
    }
  },

  updateSettings: (updates) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    
    if (updates.appearance) {
      saveAppearance(newSettings.appearance);
    }
    if (updates.workspace) {
      saveWorkspace(newSettings.workspace);
    }
    if (updates.bookkeeping) {
      saveBookkeeping(newSettings.bookkeeping);
    }
    if (updates.beancountFilePath !== undefined) {
      localStorage.setItem(BEANCOUNT_FILE_KEY, updates.beancountFilePath);
    }
  },

  updateAppearance: (updates) => {
    const newAppearance = {
      ...get().settings.appearance,
      ...updates,
    };
    const newSettings = {
      ...get().settings,
      appearance: newAppearance,
    };
    set({ settings: newSettings });
    saveAppearance(newAppearance);
  },

  updateWorkspace: (updates) => {
    const newWorkspace = {
      ...get().settings.workspace,
      ...updates,
    };
    const newSettings = {
      ...get().settings,
      workspace: newWorkspace,
    };
    set({ settings: newSettings });
    saveWorkspace(newWorkspace);
  },

  updateBookkeeping: (updates) => {
    const newBookkeeping = {
      account: {
        ...get().settings.bookkeeping.account,
        ...(updates.account || {}),
      },
      importExport: {
        ...get().settings.bookkeeping.importExport,
        ...(updates.importExport || {}),
      },
      beancount: {
        ...get().settings.bookkeeping.beancount,
        ...(updates.beancount || {}),
      },
    };
    const newSettings = {
      ...get().settings,
      bookkeeping: newBookkeeping,
    };
    set({ settings: newSettings });
    saveBookkeeping(newBookkeeping);
  },

  updateTablePreferences: (preferences) => {
    const newAppearance = {
      ...get().settings.appearance,
      tablePreferences: {
        ...get().settings.appearance.tablePreferences,
        ...preferences,
      },
    };
    const newSettings = {
      ...get().settings,
      appearance: newAppearance,
    };
    set({ settings: newSettings });
    saveAppearance(newAppearance);
  },

  resetSettings: () => {
    const filePath = get().settings.beancountFilePath;
    const reset = { ...DEFAULT_SETTINGS, beancountFilePath: filePath };
    set({ settings: reset });
    
    saveAppearance(reset.appearance);
    saveWorkspace(reset.workspace);
    saveBookkeeping(reset.bookkeeping);
    localStorage.setItem(BEANCOUNT_FILE_KEY, filePath);
  },

  applyTheme: (theme) => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove("awsui-dark-mode", "awsui-light-mode");
    body.classList.remove("awsui-dark-mode", "awsui-light-mode");

    if (theme === "dark") {
      html.classList.add("awsui-dark-mode");
      body.classList.add("awsui-dark-mode");
      html.setAttribute("data-mode", "dark");
    } else if (theme === "light") {
      html.classList.add("awsui-light-mode");
      body.classList.add("awsui-light-mode");
      html.setAttribute("data-mode", "light");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        html.classList.add("awsui-dark-mode");
        body.classList.add("awsui-dark-mode");
        html.setAttribute("data-mode", "dark");
      } else {
        html.classList.add("awsui-light-mode");
        body.classList.add("awsui-light-mode");
        html.setAttribute("data-mode", "light");
      }
    }

    get().updateAppearance({ theme });
  },

  applyLanguage: (language) => {
    document.documentElement.lang = language;
    get().updateAppearance({ language });
  },
}));

export type {
  AppSettings,
  AppearanceSettings,
  WorkspaceSettings,
  BookkeepingSettings,
  TablePreferences,
};
