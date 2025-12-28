import { useState } from "react";
import Container from "@cloudscape-design/components/container";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Select from "@cloudscape-design/components/select";
import Toggle from "@cloudscape-design/components/toggle";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/hooks/useTranslation";

const LOCALES = [
  { label: "English (US)", value: "en-US" },
  { label: "English (UK)", value: "en-GB" },
  { label: "English (India)", value: "en-IN" },
];

const LOCALE_TO_CURRENCY: Record<string, string> = {
  "en-US": "USD",
  "en-GB": "GBP",
  "en-IN": "INR",
};

const LOCALE_TO_DATE_FORMAT: Record<string, string> = {
  "en-US": "MM/DD/YYYY",
  "en-GB": "DD/MM/YYYY",
  "en-IN": "DD/MM/YYYY",
};

export default function AppearanceTab() {
  const { appearance, updateAppearance, workspace, updateWorkspace, applyTheme, applyLanguage } =
    useSettings();
  const { t } = useTranslation();

  const handleThemeChange = (theme: string) => {
    updateAppearance({ theme: theme as "light" | "dark" | "auto" });
    applyTheme(theme as "light" | "dark" | "auto");
  };

  const handleLocaleChange = (locale: string) => {
    updateAppearance({ locale, language: "en" });
    applyLanguage("en");

    const currency = LOCALE_TO_CURRENCY[locale];
    const dateFormat = LOCALE_TO_DATE_FORMAT[locale];

    if (currency) {
      updateWorkspace({
        defaultCurrency: currency,
        operatingCurrency: currency,
      });
    }

    if (dateFormat) {
      updateWorkspace({
        dateFormat,
      });
    }
  };

  return (
    <SpaceBetween size="l">
      <Container
        variant="stacked"
        header={<Header variant="h2">{t("settings.appearance.title")}</Header>}
      >
        <Form>
          <FormField label={t("settings.appearance.locale")}>
            <Select
              selectedOption={LOCALES.find((l) => l.value === appearance.locale) || LOCALES[0]}
              onChange={(e) => handleLocaleChange(e.detail.selectedOption.value || "en-US")}
              options={LOCALES}
            />
          </FormField>
        </Form>
      </Container>

      <Container
        variant="stacked"
        header={<Header variant="h2">{t("settings.appearance.theme")}</Header>}
      >
        <Form>
          <FormField label={t("settings.appearance.theme")}>
            <Select
              selectedOption={{
                label:
                  appearance.theme === "light"
                    ? t("settings.appearance.themeLight")
                    : appearance.theme === "dark"
                      ? t("settings.appearance.themeDark")
                      : t("settings.appearance.themeAuto"),
                value: appearance.theme,
              }}
              onChange={(e) => handleThemeChange(e.detail.selectedOption.value || "light")}
              options={[
                { label: t("settings.appearance.themeLight"), value: "light" },
                { label: t("settings.appearance.themeDark"), value: "dark" },
                { label: t("settings.appearance.themeAuto"), value: "auto" },
              ]}
            />
          </FormField>
        </Form>
      </Container>

      <Container
        variant="stacked"
        header={<Header variant="h2">{t("settings.appearance.tablePreferences")}</Header>}
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label="Content Density">
              <Select
                selectedOption={{
                  label:
                    appearance.tablePreferences.contentDensity === "compact"
                      ? "Compact"
                      : "Comfortable",
                  value: appearance.tablePreferences.contentDensity,
                }}
                onChange={(e) =>
                  updateAppearance({
                    tablePreferences: {
                      ...appearance.tablePreferences,
                      contentDensity:
                        (e.detail.selectedOption.value as "compact" | "comfortable") || "compact",
                    },
                  })
                }
                options={[
                  { label: "Compact", value: "compact" },
                  { label: "Comfortable", value: "comfortable" },
                ]}
              />
            </FormField>

            <FormField label="Wrap Lines" description="Enable text wrapping in table cells">
              <Toggle
                checked={appearance.tablePreferences.wrapLines}
                onChange={(e) =>
                  updateAppearance({
                    tablePreferences: {
                      ...appearance.tablePreferences,
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
                checked={appearance.tablePreferences.stickyFirstColumn}
                onChange={(e) =>
                  updateAppearance({
                    tablePreferences: {
                      ...appearance.tablePreferences,
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
                checked={appearance.tablePreferences.stickyLastColumn}
                onChange={(e) =>
                  updateAppearance({
                    tablePreferences: {
                      ...appearance.tablePreferences,
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
                checked={appearance.tablePreferences.columnReordering}
                onChange={(e) =>
                  updateAppearance({
                    tablePreferences: {
                      ...appearance.tablePreferences,
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

      <Container variant="stacked" header={<Header variant="h2">Display Options</Header>}>
        <Form>
          <SpaceBetween size="l">
            <FormField
              label="Indent"
              description="Number of spaces for indentation in Beancount files"
            >
              <Input
                type="number"
                value={appearance.indent.toString()}
                onChange={(e) =>
                  updateAppearance({
                    indent: parseInt(e.detail.value) || 2,
                  })
                }
              />
            </FormField>

            <FormField label="Currency Column" description="Column position for currency display">
              <Input
                type="number"
                value={appearance.currencyColumn.toString()}
                onChange={(e) =>
                  updateAppearance({
                    currencyColumn: parseInt(e.detail.value) || 61,
                  })
                }
              />
            </FormField>

            <FormField
              label="Invert Gains/Losses Colors"
              description="Invert color scheme for gains and losses"
            >
              <Toggle
                checked={appearance.invertGainsLossesColors}
                onChange={(e) =>
                  updateAppearance({
                    invertGainsLossesColors: e.detail.checked,
                  })
                }
              >
                Invert gains/losses colors
              </Toggle>
            </FormField>

            <FormField
              label="Invert Income/Liabilities/Equity"
              description="Invert color scheme for income, liabilities, and equity"
            >
              <Toggle
                checked={appearance.invertIncomeLiabilitiesEquity}
                onChange={(e) =>
                  updateAppearance({
                    invertIncomeLiabilitiesEquity: e.detail.checked,
                  })
                }
              >
                Invert income/liabilities/equity colors
              </Toggle>
            </FormField>

            <FormField
              label="Show Accounts with Zero Balance"
              description="Display accounts even if they have zero balance"
            >
              <Toggle
                checked={appearance.showAccountsWithZeroBalance}
                onChange={(e) =>
                  updateAppearance({
                    showAccountsWithZeroBalance: e.detail.checked,
                  })
                }
              >
                Show zero balance accounts
              </Toggle>
            </FormField>

            <FormField
              label="Show Accounts with Zero Transactions"
              description="Display accounts even if they have no transactions"
            >
              <Toggle
                checked={appearance.showAccountsWithZeroTransactions}
                onChange={(e) =>
                  updateAppearance({
                    showAccountsWithZeroTransactions: e.detail.checked,
                  })
                }
              >
                Show zero transaction accounts
              </Toggle>
            </FormField>

            <FormField
              label="Show Closed Accounts"
              description="Display accounts that have been closed"
            >
              <Toggle
                checked={appearance.showClosedAccounts}
                onChange={(e) =>
                  updateAppearance({
                    showClosedAccounts: e.detail.checked,
                  })
                }
              >
                Show closed accounts
              </Toggle>
            </FormField>

            <FormField
              label="Sidebar Show Queries"
              description="Number of queries to show in sidebar"
            >
              <Input
                type="number"
                value={appearance.sidebarShowQueries.toString()}
                onChange={(e) =>
                  updateAppearance({
                    sidebarShowQueries: parseInt(e.detail.value) || 5,
                  })
                }
              />
            </FormField>

            <FormField label="Upcoming Events" description="Number of upcoming events to display">
              <Input
                type="number"
                value={appearance.upcomingEvents.toString()}
                onChange={(e) =>
                  updateAppearance({
                    upcomingEvents: parseInt(e.detail.value) || 7,
                  })
                }
              />
            </FormField>

            <FormField
              label="Up-to-date Indicator Grey Lookback Days"
              description="Number of days to look back for up-to-date indicator"
            >
              <Input
                type="number"
                value={appearance.uptodateIndicatorGreyLookbackDays.toString()}
                onChange={(e) =>
                  updateAppearance({
                    uptodateIndicatorGreyLookbackDays: parseInt(e.detail.value) || 60,
                  })
                }
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Container>
    </SpaceBetween>
  );
}
