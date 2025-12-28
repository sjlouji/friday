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

export default function WorkspaceTab() {
  const { workspace, updateWorkspace } = useSettings();
  const { t } = useTranslation();

  return (
    <SpaceBetween size="l">
      <Container
        variant="stacked"
        header={<Header variant="h2">{t("settings.workspace.currency")}</Header>}
      >
        <Form>
          <SpaceBetween direction="vertical" size="l">
            <FormField label={t("settings.workspace.operatingCurrency")}>
              <Select
                selectedOption={
                  CURRENCIES.find(
                    (c) => c.value === workspace.operatingCurrency
                  ) || CURRENCIES[0]
                }
                onChange={(e) =>
                  updateWorkspace({
                    operatingCurrency: e.detail.selectedOption.value || "INR",
                  })
                }
                options={CURRENCIES}
                filteringType="auto"
              />
            </FormField>
            <FormField label={t("settings.workspace.defaultCurrency")}>
              <Select
                selectedOption={
                  CURRENCIES.find(
                    (c) => c.value === workspace.defaultCurrency
                  ) || CURRENCIES[0]
                }
                onChange={(e) =>
                  updateWorkspace({
                    defaultCurrency: e.detail.selectedOption.value || "INR",
                  })
                }
                options={CURRENCIES}
                filteringType="auto"
              />
            </FormField>
            <FormField label={t("settings.workspace.conversionCurrency")}>
              <Input
                value={workspace.conversionCurrency}
                onChange={(e) =>
                  updateWorkspace({
                    conversionCurrency: e.detail.value,
                  })
                }
                placeholder="NOTHING"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Container>

      <Container
        variant="stacked"
        header={<Header variant="h2">{t("settings.workspace.dateTime")}</Header>}
      >
        <Form>
          <SpaceBetween direction="vertical" size="l">
            <FormField label={t("settings.workspace.dateFormat")}>
              <Select
                selectedOption={{
                  label: workspace.dateFormat,
                  value: workspace.dateFormat,
                }}
                onChange={(e) =>
                  updateWorkspace({
                    dateFormat: e.detail.selectedOption.value || "YYYY-MM-DD",
                  })
                }
                options={[
                  { label: t("settings.workspace.dateFormatDDMMYYYY"), value: "DD/MM/YYYY" },
                  { label: t("settings.workspace.dateFormatYYYYMMDD"), value: "YYYY-MM-DD" },
                  { label: t("settings.workspace.dateFormatMMDDYYYY"), value: "MM/DD/YYYY" },
                  { label: t("settings.workspace.dateFormatDDMMYYYYDot"), value: "DD.MM.YYYY" },
                ]}
              />
            </FormField>
            <FormField label={t("settings.workspace.timeFormat")}>
              <Select
                selectedOption={{
                  label: workspace.timeFormat === "12h" ? t("settings.workspace.timeFormat12h") : t("settings.workspace.timeFormat24h"),
                  value: workspace.timeFormat,
                }}
                onChange={(e) =>
                  updateWorkspace({
                    timeFormat: (e.detail.selectedOption.value as "12h" | "24h") || "24h",
                  })
                }
                options={[
                  { label: t("settings.workspace.timeFormat12h"), value: "12h" },
                  { label: t("settings.workspace.timeFormat24h"), value: "24h" },
                ]}
              />
            </FormField>
            <FormField label={t("settings.workspace.fiscalYearStart")}>
              <Select
                selectedOption={
                  FISCAL_YEAR_MONTHS.find(
                    (m) => m.value === workspace.fiscalYearStart.split("-")[0]
                  ) || FISCAL_YEAR_MONTHS[0]
                }
                onChange={(e) => {
                  const month = e.detail.selectedOption.value || "01";
                  const day = workspace.fiscalYearStart.split("-")[1] || "01";
                  updateWorkspace({
                    fiscalYearStart: `${month}-${day}`,
                  });
                }}
                options={FISCAL_YEAR_MONTHS}
              />
            </FormField>
            <FormField label={t("settings.workspace.fiscalYearEnd")}>
              <SpaceBetween direction="horizontal" size="xs">
                <FormField label={t("settings.workspace.month")}>
                  <Input
                    type="number"
                    value={workspace.fiscalYearEnd.month.toString()}
                    onChange={(e) =>
                      updateWorkspace({
                        fiscalYearEnd: {
                          ...workspace.fiscalYearEnd,
                          month: parseInt(e.detail.value) || 12,
                        },
                      })
                    }
                  />
                </FormField>
                <FormField label={t("settings.workspace.day")}>
                  <Input
                    type="number"
                    value={workspace.fiscalYearEnd.day.toString()}
                    onChange={(e) =>
                      updateWorkspace({
                        fiscalYearEnd: {
                          ...workspace.fiscalYearEnd,
                          day: parseInt(e.detail.value) || 31,
                        },
                      })
                    }
                  />
                </FormField>
              </SpaceBetween>
            </FormField>
          </SpaceBetween>
        </Form>
      </Container>

      <Container
        variant="stacked"
        header={<Header variant="h2">{t("settings.workspace.fileSettings")}</Header>}
      >
        <Form>
          <SpaceBetween direction="vertical" size="l">
            <FormField
              label={t("settings.workspace.defaultFile")}
              description={t("settings.workspace.defaultFileDescription")}
            >
              <Input
                value={workspace.defaultFile || ""}
                onChange={(e) =>
                  updateWorkspace({
                    defaultFile: e.detail.value || null,
                  })
                }
                placeholder="Leave empty for none"
              />
            </FormField>
            <FormField
              label={t("settings.workspace.defaultPage")}
              description={t("settings.workspace.defaultPageDescription")}
            >
              <Input
                value={workspace.defaultPage}
                onChange={(e) =>
                  updateWorkspace({
                    defaultPage: e.detail.value,
                  })
                }
                placeholder="income_statement/"
              />
            </FormField>
            <FormField
              label={t("settings.workspace.autoReload")}
              description={t("settings.workspace.autoReloadDescription")}
            >
              <Toggle
                checked={workspace.autoReload}
                onChange={(e) =>
                  updateWorkspace({
                    autoReload: e.detail.checked,
                  })
                }
              >
                {t("settings.workspace.autoReload")}
              </Toggle>
            </FormField>
            <FormField
              label={t("settings.workspace.useExternalEditor")}
              description={t("settings.workspace.useExternalEditorDescription")}
            >
              <Toggle
                checked={workspace.useExternalEditor}
                onChange={(e) =>
                  updateWorkspace({
                    useExternalEditor: e.detail.checked,
                  })
                }
              >
                {t("settings.workspace.useExternalEditor")}
              </Toggle>
            </FormField>
          </SpaceBetween>
        </Form>
      </Container>
    </SpaceBetween>
  );
}

