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

const STORAGE_KEY = "friday-settings";
const BEANCOUNT_FILE_KEY = "beancount_file_path";
const OLD_STORAGE_KEY = "beancount-settings";
const SETTINGS_VERSION = 2;

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

const migrateFromOldFormat = (oldSettings: OldSettings): AppSettings => {
  const migrated: AppSettings = {
    ...DEFAULT_SETTINGS,
    beancountFilePath: localStorage.getItem(BEANCOUNT_FILE_KEY) || "",
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

  return migrated;
};

const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const filePath = localStorage.getItem(BEANCOUNT_FILE_KEY) || "";

    if (saved) {
      const parsed = JSON.parse(saved);

      if (parsed.version === SETTINGS_VERSION && parsed.settings) {
        return {
          ...DEFAULT_SETTINGS,
          ...parsed.settings,
          beancountFilePath: filePath || parsed.settings.beancountFilePath || "",
          appearance: {
            ...DEFAULT_APPEARANCE,
            ...(parsed.settings.appearance || {}),
            tablePreferences: {
              ...DEFAULT_APPEARANCE.tablePreferences,
              ...(parsed.settings.appearance?.tablePreferences || {}),
            },
          },
          workspace: {
            ...DEFAULT_WORKSPACE,
            ...(parsed.settings.workspace || {}),
          },
          bookkeeping: {
            account: {
              ...DEFAULT_BOOKKEEPING.account,
              ...(parsed.settings.bookkeeping?.account || {}),
              defaultAccountTypes: {
                ...DEFAULT_BOOKKEEPING.account.defaultAccountTypes,
                ...(parsed.settings.bookkeeping?.account?.defaultAccountTypes || {}),
              },
            },
            importExport: {
              ...DEFAULT_BOOKKEEPING.importExport,
              ...(parsed.settings.bookkeeping?.importExport || {}),
            },
            beancount: {
              ...DEFAULT_BOOKKEEPING.beancount,
              ...(parsed.settings.bookkeeping?.beancount || {}),
            },
          },
        };
      }

      if (
        parsed.version &&
        typeof parsed.version === "number" &&
        parsed.version < SETTINGS_VERSION
      ) {
        return migrateFromOldFormat((parsed.settings || parsed) as OldSettings);
      }
    }

    const oldSettings = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldSettings) {
      try {
        const parsed = JSON.parse(oldSettings);
        const migrated = migrateFromOldFormat(parsed);
        saveSettings(migrated);
        localStorage.removeItem(OLD_STORAGE_KEY);
        return migrated;
      } catch {
        console.warn("Failed to migrate old settings");
      }
    }

    return { ...DEFAULT_SETTINGS, beancountFilePath: filePath };
  } catch (error) {
    console.error("Failed to load settings", error);
    const filePath = localStorage.getItem(BEANCOUNT_FILE_KEY) || "";
    return { ...DEFAULT_SETTINGS, beancountFilePath: filePath };
  }
};

const saveSettings = (settings: AppSettings) => {
  try {
    const toSave = {
      version: SETTINGS_VERSION,
      settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    localStorage.setItem(BEANCOUNT_FILE_KEY, settings.beancountFilePath);
  } catch (error) {
    console.error("Failed to save settings", error);
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
    saveSettings(newSettings);
  },

  updateAppearance: (updates) => {
    const newSettings = {
      ...get().settings,
      appearance: {
        ...get().settings.appearance,
        ...updates,
      },
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  updateWorkspace: (updates) => {
    const newSettings = {
      ...get().settings,
      workspace: {
        ...get().settings.workspace,
        ...updates,
      },
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  updateBookkeeping: (updates) => {
    const newSettings = {
      ...get().settings,
      bookkeeping: {
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
      },
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  updateTablePreferences: (preferences) => {
    const newSettings = {
      ...get().settings,
      appearance: {
        ...get().settings.appearance,
        tablePreferences: {
          ...get().settings.appearance.tablePreferences,
          ...preferences,
        },
      },
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  resetSettings: () => {
    const filePath = get().settings.beancountFilePath;
    const reset = { ...DEFAULT_SETTINGS, beancountFilePath: filePath };
    set({ settings: reset });
    saveSettings(reset);
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
