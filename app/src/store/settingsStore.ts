import { create } from "zustand";

export interface TablePreferences {
  contentDensity: "compact" | "comfortable";
  wrapLines: boolean;
  stickyFirstColumn: boolean;
  stickyLastColumn: boolean;
  columnReordering: boolean;
}

export interface BeancountSettings {
  operatingCurrency: string;
  accountNameSeparator: string;
  defaultAccountTypes: {
    assets: string;
    liabilities: string;
    equity: string;
    income: string;
    expenses: string;
  };
  priceDatabase: string;
  includeOptions: string[];
  excludeOptions: string[];
  defaultFlag: string;
  defaultNarration: string;
  useLegacyMetadata: boolean;
}

export interface AppSettings {
  beancountFilePath: string;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  fiscalYearStart: string;
  language: string;
  locale: string;
  theme: "light" | "dark" | "auto";
  tablePreferences: TablePreferences;
  beancount: BeancountSettings;
}

const STORAGE_KEY = "friday-settings";
const BEANCOUNT_FILE_KEY = "beancount_file_path";

const defaultSettings: AppSettings = {
  beancountFilePath: "",
  defaultCurrency: "INR",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  fiscalYearStart: "04-01",
  language: "en",
  locale: "en-IN",
  theme: "light",
  tablePreferences: {
    contentDensity: "compact",
    wrapLines: true,
    stickyFirstColumn: true,
    stickyLastColumn: true,
    columnReordering: true,
  },
  beancount: {
    operatingCurrency: "INR",
    accountNameSeparator: ":",
    defaultAccountTypes: {
      assets: "Assets",
      liabilities: "Liabilities",
      equity: "Equity",
      income: "Income",
      expenses: "Expenses",
    },
    priceDatabase: "",
    includeOptions: [],
    excludeOptions: [],
    defaultFlag: "*",
    defaultNarration: "",
    useLegacyMetadata: false,
  },
};

const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const filePath = localStorage.getItem(BEANCOUNT_FILE_KEY) || "";

    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultSettings,
        ...parsed,
        beancountFilePath: filePath || parsed.beancountFilePath || "",
        tablePreferences: {
          ...defaultSettings.tablePreferences,
          ...(parsed.tablePreferences || {}),
        },
        beancount: {
          ...defaultSettings.beancount,
          ...(parsed.beancount || {}),
        },
      };
    }

    return { ...defaultSettings, beancountFilePath: filePath };
  } catch {
    const filePath = localStorage.getItem(BEANCOUNT_FILE_KEY) || "";
    return { ...defaultSettings, beancountFilePath: filePath };
  }
};

const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
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
  updateTablePreferences: (preferences: Partial<TablePreferences>) => void;
  updateBeancountSettings: (settings: Partial<BeancountSettings>) => void;
  resetSettings: () => void;
  applyTheme: (theme: "light" | "dark" | "auto") => void;
  applyLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;

    const loaded = loadSettings();
    set({ settings: loaded, initialized: true });

    get().applyTheme(loaded.theme);
    get().applyLanguage(loaded.language);

    if (loaded.theme === "auto") {
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

  updateTablePreferences: (preferences) => {
    const newSettings = {
      ...get().settings,
      tablePreferences: {
        ...get().settings.tablePreferences,
        ...preferences,
      },
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  updateBeancountSettings: (settings) => {
    const newSettings = {
      ...get().settings,
      beancount: {
        ...get().settings.beancount,
        ...settings,
      },
    };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },

  resetSettings: () => {
    const filePath = get().settings.beancountFilePath;
    const reset = { ...defaultSettings, beancountFilePath: filePath };
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
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
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

    get().updateSettings({ theme });
  },

  applyLanguage: (language) => {
    document.documentElement.lang = language;
    get().updateSettings({ language });
  },
}));
