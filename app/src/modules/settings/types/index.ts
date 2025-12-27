export interface TablePreferences {
  contentDensity: "compact" | "comfortable";
  wrapLines: boolean;
  stickyFirstColumn: boolean;
  stickyLastColumn: boolean;
  columnReordering: boolean;
}

export interface AppearanceSettings {
  language: string;
  locale: string;
  theme: "light" | "dark" | "auto";
  indent: number;
  currencyColumn: number;
  invertGainsLossesColors: boolean;
  invertIncomeLiabilitiesEquity: boolean;
  showAccountsWithZeroBalance: boolean;
  showAccountsWithZeroTransactions: boolean;
  showClosedAccounts: boolean;
  sidebarShowQueries: number;
  upcomingEvents: number;
  uptodateIndicatorGreyLookbackDays: number;
  tablePreferences: TablePreferences;
}

export interface WorkspaceSettings {
  operatingCurrency: string;
  conversionCurrency: string;
  conversionCurrencies: string[];
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  fiscalYearEnd: { month: number; day: number };
  fiscalYearStart: string;
  defaultFile: string | null;
  defaultPage: string;
  autoReload: boolean;
  useExternalEditor: boolean;
}

export interface AccountSettings {
  accountJournalIncludeChildren: boolean;
  accountCurrentConversions: string;
  accountCurrentEarnings: string;
  accountPreviousBalances: string;
  accountPreviousConversions: string;
  accountPreviousEarnings: string;
  accountRounding: string | null;
  accountUnrealizedGains: string;
  accountNameSeparator: string;
  defaultAccountTypes: {
    assets: string;
    liabilities: string;
    equity: string;
    income: string;
    expenses: string;
  };
}

export interface ImportExportSettings {
  importConfig: string | null;
  importDirs: string[];
  insertEntry: string[];
  collapsePattern: string[];
}

export interface BeancountCoreSettings {
  bookingMethod: string;
  allowDeprecatedNoneForTagsAndLinks: boolean;
  allowPipeSeparator: boolean;
  commodities: string[];
  displayPrecision: Record<string, number>;
  documents: string[];
  filename: string;
  include: string[];
  inferToleranceFromCost: boolean;
  inferredToleranceDefault: Record<string, number>;
  inferredToleranceMultiplier: number;
  longStringMaxlines: number;
  plugin: string[];
  pluginProcessingMode: string;
  pythonpath: string[];
  renderCommas: boolean;
  title: string;
  toleranceMultiplier: number;
  unrealized: string;
  defaultFlag: string;
  defaultNarration: string;
  useLegacyMetadata: boolean;
}

export interface BookkeepingSettings {
  account: AccountSettings;
  importExport: ImportExportSettings;
  beancount: BeancountCoreSettings;
}

export interface AppSettings {
  beancountFilePath: string;
  appearance: AppearanceSettings;
  workspace: WorkspaceSettings;
  bookkeeping: BookkeepingSettings;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  language: "en",
  locale: "en-US",
  theme: "light",
  indent: 2,
  currencyColumn: 61,
  invertGainsLossesColors: false,
  invertIncomeLiabilitiesEquity: false,
  showAccountsWithZeroBalance: true,
  showAccountsWithZeroTransactions: true,
  showClosedAccounts: false,
  sidebarShowQueries: 5,
  upcomingEvents: 7,
  uptodateIndicatorGreyLookbackDays: 60,
  tablePreferences: {
    contentDensity: "compact",
    wrapLines: true,
    stickyFirstColumn: true,
    stickyLastColumn: true,
    columnReordering: true,
  },
};

export const DEFAULT_WORKSPACE: WorkspaceSettings = {
  operatingCurrency: "INR",
  conversionCurrency: "NOTHING",
  conversionCurrencies: [],
  defaultCurrency: "INR",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  fiscalYearEnd: { month: 12, day: 31 },
  fiscalYearStart: "04-01",
  defaultFile: null,
  defaultPage: "income_statement/",
  autoReload: false,
  useExternalEditor: false,
};

export const DEFAULT_ACCOUNT: AccountSettings = {
  accountJournalIncludeChildren: true,
  accountCurrentConversions: "Conversions:Current",
  accountCurrentEarnings: "Earnings:Current",
  accountPreviousBalances: "Opening-Balances",
  accountPreviousConversions: "Conversions:Previous",
  accountPreviousEarnings: "Earnings:Previous",
  accountRounding: null,
  accountUnrealizedGains: "Earnings:Unrealized",
  accountNameSeparator: ":",
  defaultAccountTypes: {
    assets: "Assets",
    liabilities: "Liabilities",
    equity: "Equity",
    income: "Income",
    expenses: "Expenses",
  },
};

export const DEFAULT_IMPORT_EXPORT: ImportExportSettings = {
  importConfig: null,
  importDirs: [],
  insertEntry: [],
  collapsePattern: [],
};

export const DEFAULT_BEANCOUNT_CORE: BeancountCoreSettings = {
  bookingMethod: "STRICT",
  allowDeprecatedNoneForTagsAndLinks: false,
  allowPipeSeparator: false,
  commodities: [],
  displayPrecision: {},
  documents: [],
  filename: "",
  include: [],
  inferToleranceFromCost: false,
  inferredToleranceDefault: {},
  inferredToleranceMultiplier: 0.5,
  longStringMaxlines: 64,
  plugin: [],
  pluginProcessingMode: "default",
  pythonpath: [],
  renderCommas: false,
  title: "",
  toleranceMultiplier: 0.5,
  unrealized: "Unrealized",
  defaultFlag: "*",
  defaultNarration: "",
  useLegacyMetadata: false,
};

export const DEFAULT_BOOKKEEPING: BookkeepingSettings = {
  account: DEFAULT_ACCOUNT,
  importExport: DEFAULT_IMPORT_EXPORT,
  beancount: DEFAULT_BEANCOUNT_CORE,
};

export const DEFAULT_SETTINGS: AppSettings = {
  beancountFilePath: "",
  appearance: DEFAULT_APPEARANCE,
  workspace: DEFAULT_WORKSPACE,
  bookkeeping: DEFAULT_BOOKKEEPING,
};
