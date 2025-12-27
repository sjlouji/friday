import { useState, useEffect } from "react";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Grid from "@cloudscape-design/components/grid";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Toggle from "@cloudscape-design/components/toggle";
import { api } from "@/services/api";

const BEANCOUNT_FILE_KEY = "beancount_file_path";

// Comprehensive currency list - INR first for Indian accounting
const CURRENCIES = [
  { label: "INR - Indian Rupee (₹)", value: "INR" },
  { label: "USD - US Dollar", value: "USD" },
  { label: "EUR - Euro", value: "EUR" },
  { label: "GBP - British Pound", value: "GBP" },
  { label: "JPY - Japanese Yen", value: "JPY" },
  { label: "AUD - Australian Dollar", value: "AUD" },
  { label: "CAD - Canadian Dollar", value: "CAD" },
  { label: "CHF - Swiss Franc", value: "CHF" },
  { label: "CNY - Chinese Yuan", value: "CNY" },
  { label: "BRL - Brazilian Real", value: "BRL" },
  { label: "ZAR - South African Rand", value: "ZAR" },
  { label: "MXN - Mexican Peso", value: "MXN" },
  { label: "SGD - Singapore Dollar", value: "SGD" },
  { label: "HKD - Hong Kong Dollar", value: "HKD" },
  { label: "NZD - New Zealand Dollar", value: "NZD" },
  { label: "SEK - Swedish Krona", value: "SEK" },
  { label: "NOK - Norwegian Krone", value: "NOK" },
  { label: "DKK - Danish Krone", value: "DKK" },
  { label: "PLN - Polish Zloty", value: "PLN" },
  { label: "TRY - Turkish Lira", value: "TRY" },
  { label: "RUB - Russian Ruble", value: "RUB" },
  { label: "KRW - South Korean Won", value: "KRW" },
  { label: "THB - Thai Baht", value: "THB" },
  { label: "MYR - Malaysian Ringgit", value: "MYR" },
  { label: "IDR - Indonesian Rupiah", value: "IDR" },
  { label: "PHP - Philippine Peso", value: "PHP" },
  { label: "VND - Vietnamese Dong", value: "VND" },
  { label: "AED - UAE Dirham", value: "AED" },
  { label: "SAR - Saudi Riyal", value: "SAR" },
  { label: "ILS - Israeli Shekel", value: "ILS" },
  { label: "ARS - Argentine Peso", value: "ARS" },
  { label: "CLP - Chilean Peso", value: "CLP" },
  { label: "COP - Colombian Peso", value: "COP" },
  { label: "PEN - Peruvian Sol", value: "PEN" },
  { label: "CZK - Czech Koruna", value: "CZK" },
  { label: "HUF - Hungarian Forint", value: "HUF" },
  { label: "RON - Romanian Leu", value: "RON" },
  { label: "BGN - Bulgarian Lev", value: "BGN" },
  { label: "HRK - Croatian Kuna", value: "HRK" },
  { label: "ISK - Icelandic Krona", value: "ISK" },
];

// Fiscal year start months - April first for Indian accounting
const FISCAL_YEAR_MONTHS = [
  { label: "April (04) - Indian FY", value: "04" },
  { label: "January (01)", value: "01" },
  { label: "February (02)", value: "02" },
  { label: "March (03)", value: "03" },
  { label: "May (05)", value: "05" },
  { label: "June (06)", value: "06" },
  { label: "July (07)", value: "07" },
  { label: "August (08)", value: "08" },
  { label: "September (09)", value: "09" },
  { label: "October (10)", value: "10" },
  { label: "November (11)", value: "11" },
  { label: "December (12)", value: "12" },
];

// Languages
const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Español (Spanish)", value: "es" },
  { label: "Français (French)", value: "fr" },
  { label: "Deutsch (German)", value: "de" },
  { label: "中文 (Chinese)", value: "zh" },
  { label: "日本語 (Japanese)", value: "ja" },
  { label: "한국어 (Korean)", value: "ko" },
  { label: "Português (Portuguese)", value: "pt" },
  { label: "Italiano (Italian)", value: "it" },
  { label: "Русский (Russian)", value: "ru" },
  { label: "العربية (Arabic)", value: "ar" },
  { label: "हिन्दी (Hindi)", value: "hi" },
];

export default function Settings() {
  const [filePath, setFilePath] = useState("");
  const [settings, setSettings] = useState({
    defaultCurrency: "INR",
    dateFormat: "DD/MM/YYYY",
    fiscalYearStart: "04-01",
    language: "en",
    theme: "light",
    tablePreferences: {
      contentDensity: "compact",
      wrapLines: true,
      stickyFirstColumn: true,
      stickyLastColumn: true,
      columnReordering: true,
    },
  });
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(
    null
  );
  const [createStatus, setCreateStatus] = useState<"success" | "error" | null>(
    null
  );
  const [createMessage, setCreateMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Load file path from localStorage
    const savedPath = localStorage.getItem(BEANCOUNT_FILE_KEY);
    if (savedPath) {
      setFilePath(savedPath);
    }

    // Load other settings
    const savedSettings = localStorage.getItem("beancount-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const mergedSettings = {
          ...settings,
          ...parsed,
          tablePreferences: {
            contentDensity: "compact",
            wrapLines: true,
            stickyFirstColumn: true,
            stickyLastColumn: true,
            columnReordering: true,
            ...(parsed.tablePreferences || {}),
          },
        };
        setSettings(mergedSettings);
        // Apply theme immediately
        applyTheme(parsed.theme);
        // Apply language
        applyLanguage(parsed.language);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => {
      const savedSettings = localStorage.getItem("beancount-settings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.theme === "auto") {
            applyTheme("auto");
          }
        } catch (e) {
          // Ignore
        }
      }
    };

    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  const applyTheme = (theme: string) => {
    const html = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
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
      // Auto - use system preference
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
  };

  const applyLanguage = (language: string) => {
    document.documentElement.lang = language;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name;
      // Browsers don't expose full file paths for security reasons
      // We'll show an alert asking the user to provide the full path
      alert(
        `Selected file: ${fileName}\n\nPlease enter the full path to this file in the input field above.\n\nExample: /Users/yourname/Documents/${fileName}`
      );
      // Don't auto-populate, let user enter the full path manually
    }
    // Reset the input so the same file can be selected again
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleFilePathChange = (value: string) => {
    setFilePath(value);
  };

  const handleSave = async () => {
    if (!filePath.trim()) {
      setSaveStatus("error");
      return;
    }

    // Validate that the file path is a full path, not just a filename
    if (!filePath.includes("/") && !filePath.includes("\\")) {
      setSaveStatus("error");
      alert(
        "Please provide the full path to the file (e.g., /Users/username/Documents/ledger.beancount), not just the filename."
      );
      return;
    }

    localStorage.setItem(BEANCOUNT_FILE_KEY, filePath);
    localStorage.setItem("beancount-settings", JSON.stringify(settings));

    // Apply theme and language immediately
    applyTheme(settings.theme);
    applyLanguage(settings.language);

    setSaveStatus("success");

    // Reload page to apply new file path and load data
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleThemeChange = (theme: string) => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    applyTheme(theme);
  };

  const handleLanguageChange = (language: string) => {
    const newSettings = { ...settings, language };
    setSettings(newSettings);
    applyLanguage(language);
  };

  const handleCreateFile = async () => {
    if (!filePath.trim()) {
      setCreateStatus("error");
      setCreateMessage("Please provide a file path");
      return;
    }

    setIsCreating(true);
    setCreateStatus(null);
    setCreateMessage("");

    try {
      const result = await api.files.create(filePath);
      setCreateStatus("success");
      setCreateMessage(result.message || "File created successfully!");

      // Auto-save the file path to localStorage
      localStorage.setItem(BEANCOUNT_FILE_KEY, filePath);

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setCreateStatus("error");
      setCreateMessage(error.message || "Failed to create file");
    } finally {
      setIsCreating(false);
    }
  };

  const breadcrumbs = [
    { text: "Friday", href: "/" },
    { text: "Settings", href: "/settings" },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Configure your Friday preferences"
        actions={
          <Button variant="primary" iconName="save" onClick={handleSave}>
            Save Settings
          </Button>
        }
      >
        Settings
      </Header>

      {saveStatus === "success" && (
        <Alert type="success" dismissible onDismiss={() => setSaveStatus(null)}>
          Settings saved successfully! Reloading...
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert type="error" dismissible onDismiss={() => setSaveStatus(null)}>
          Please provide a valid Beancount file path.
        </Alert>
      )}

      {createStatus === "success" && (
        <Alert
          type="success"
          dismissible
          onDismiss={() => setCreateStatus(null)}
        >
          {createMessage}
        </Alert>
      )}

      {createStatus === "error" && (
        <Alert type="error" dismissible onDismiss={() => setCreateStatus(null)}>
          {createMessage}
        </Alert>
      )}

      <Container
        variant="stacked"
        header={
          <Header
            variant="h2"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <input
                  type="file"
                  accept=".beancount,.bean"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="file-input"
                />
                <Button
                  variant="normal"
                  iconName="folder-open"
                  onClick={() => {
                    const input = document.getElementById(
                      "file-input"
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                >
                  Select File
                </Button>
                <Button
                  variant="normal"
                  iconName={isCreating ? undefined : "add-plus"}
                  onClick={handleCreateFile}
                  disabled={isCreating || !filePath.trim()}
                >
                  {isCreating ? "Creating..." : "Create New File"}
                </Button>
              </SpaceBetween>
            }
          >
            Beancount File
          </Header>
        }
      >
        <Form>
          <FormField
            label="Beancount File Path"
            description="Enter the full path to your Beancount ledger file or use 'Select File' to browse for one."
          >
            <Input
              value={filePath}
              onChange={(e) => handleFilePathChange(e.detail.value)}
              placeholder="/Users/username/Documents/ledger.beancount"
            />
          </FormField>
        </Form>
      </Container>

      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container
          variant="stacked"
          header={<Header variant="h2">Currency</Header>}
        >
          <Form>
            <FormField label="Default Currency">
              <Select
                selectedOption={
                  CURRENCIES.find(
                    (c) => c.value === settings.defaultCurrency
                  ) || CURRENCIES[0]
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultCurrency: e.detail.selectedOption.value || "USD",
                  })
                }
                options={CURRENCIES}
                filteringType="auto"
                placeholder="Select currency"
              />
            </FormField>
          </Form>
        </Container>

        <Container
          variant="stacked"
          header={<Header variant="h2">Date & Time</Header>}
        >
          <Form>
            <SpaceBetween direction="vertical" size="l">
              <FormField label="Date Format">
                <Select
                  selectedOption={{
                    label: settings.dateFormat,
                    value: settings.dateFormat,
                  }}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dateFormat: e.detail.selectedOption.value || "YYYY-MM-DD",
                    })
                  }
                  options={[
                    { label: "DD/MM/YYYY (Indian)", value: "DD/MM/YYYY" },
                    { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
                    { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
                    { label: "DD.MM.YYYY", value: "DD.MM.YYYY" },
                  ]}
                />
              </FormField>
              <FormField label="Fiscal Year Start Month">
                <Select
                  selectedOption={
                    FISCAL_YEAR_MONTHS.find(
                      (m) => m.value === settings.fiscalYearStart.split("-")[0]
                    ) || FISCAL_YEAR_MONTHS[0]
                  }
                  onChange={(e) => {
                    const month = e.detail.selectedOption.value || "01";
                    const day = settings.fiscalYearStart.split("-")[1] || "01";
                    setSettings({
                      ...settings,
                      fiscalYearStart: `${month}-${day}`,
                    });
                  }}
                  options={FISCAL_YEAR_MONTHS}
                  placeholder="Select month"
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Container>

        <Container
          variant="stacked"
          header={<Header variant="h2">Localization</Header>}
        >
          <Form>
            <FormField label="Language">
              <Select
                selectedOption={
                  LANGUAGES.find((l) => l.value === settings.language) ||
                  LANGUAGES[0]
                }
                onChange={(e) => {
                  const lang = e.detail.selectedOption.value || "en";
                  handleLanguageChange(lang);
                }}
                options={LANGUAGES}
                filteringType="auto"
                placeholder="Select language"
              />
            </FormField>
          </Form>
        </Container>

        <Container
          variant="stacked"
          header={<Header variant="h2">Appearance</Header>}
        >
          <Form>
            <FormField label="Theme">
              <Select
                selectedOption={{
                  label:
                    settings.theme === "light"
                      ? "Light"
                      : settings.theme === "dark"
                      ? "Dark"
                      : "Auto",
                  value: settings.theme,
                }}
                onChange={(e) => {
                  const theme = e.detail.selectedOption.value || "light";
                  handleThemeChange(theme);
                }}
                options={[
                  { label: "Light", value: "light" },
                  { label: "Dark", value: "dark" },
                  { label: "Auto (System)", value: "auto" },
                ]}
              />
            </FormField>
          </Form>
        </Container>
      </Grid>

      <Container
        variant="stacked"
        header={<Header variant="h2">Table Preferences</Header>}
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label="Content Density">
              <Select
                selectedOption={
                  [
                    { label: "Compact", value: "compact" },
                    { label: "Comfortable", value: "comfortable" },
                  ].find(
                    (o) => o.value === settings.tablePreferences.contentDensity
                  ) || { label: "Compact", value: "compact" }
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tablePreferences: {
                      ...settings.tablePreferences,
                      contentDensity:
                        e.detail.selectedOption.value || "compact",
                    },
                  })
                }
                options={[
                  { label: "Compact", value: "compact" },
                  { label: "Comfortable", value: "comfortable" },
                ]}
              />
            </FormField>

            <FormField
              label="Wrap Lines"
              description="Enable text wrapping in table cells"
            >
              <Toggle
                checked={settings.tablePreferences.wrapLines}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tablePreferences: {
                      ...settings.tablePreferences,
                      wrapLines: e.detail.checked,
                    },
                  })
                }
              >
                Wrap lines in table cells
              </Toggle>
            </FormField>

            <FormField
              label="Sticky First Column"
              description="Keep the first column fixed when scrolling horizontally"
            >
              <Toggle
                checked={settings.tablePreferences.stickyFirstColumn}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tablePreferences: {
                      ...settings.tablePreferences,
                      stickyFirstColumn: e.detail.checked,
                    },
                  })
                }
              >
                Fix first column
              </Toggle>
            </FormField>

            <FormField
              label="Sticky Last Column"
              description="Keep the last column (Actions) fixed when scrolling horizontally"
            >
              <Toggle
                checked={settings.tablePreferences.stickyLastColumn}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tablePreferences: {
                      ...settings.tablePreferences,
                      stickyLastColumn: e.detail.checked,
                    },
                  })
                }
              >
                Fix last column
              </Toggle>
            </FormField>

            <FormField
              label="Column Reordering"
              description="Allow dragging column headers to reorder columns"
            >
              <Toggle
                checked={settings.tablePreferences.columnReordering}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tablePreferences: {
                      ...settings.tablePreferences,
                      columnReordering: e.detail.checked,
                    },
                  })
                }
              >
                Enable column reordering
              </Toggle>
            </FormField>
          </SpaceBetween>
        </Form>
      </Container>
    </SpaceBetween>
  );
}
