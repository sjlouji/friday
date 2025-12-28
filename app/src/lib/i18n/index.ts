import enUSData from "./en-US.json";
import enGBData from "./en-GB.json";
import enINData from "./en-IN.json";

type Translations = typeof enUSData;
type Locale = "en-US" | "en-GB" | "en-IN";

const translations: Record<Locale, Translations> = {
  "en-US": enUSData,
  "en-GB": enGBData,
  "en-IN": enINData,
};

export function getTranslations(locale: string = "en-US"): Translations {
  const normalizedLocale = locale as Locale;
  return translations[normalizedLocale] || translations["en-US"];
}

export function t(key: string, locale?: string): string {
  const settings = useSettingsStore.getState().settings;
  const currentLocale = locale || settings.appearance.locale || "en-US";
  const translations = getTranslations(currentLocale);

  const keys = key.split(".");
  let value: any = translations;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}

export function useTranslation() {
  const settings = useSettingsStore.getState().settings;
  const locale = settings.appearance.locale || "en-US";
  const translations = getTranslations(locale);

  const translate = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  return { t: translate, locale, translations };
}
