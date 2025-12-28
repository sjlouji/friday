import { useMemo } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { getTranslations } from "@/lib/i18n";

export function useTranslation() {
  const locale = useSettingsStore((state) => state.settings.appearance.locale || "en-US");
  const translations = useMemo(() => getTranslations(locale), [locale]);

  const t = (key: string): string => {
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

  return { t, locale, translations };
}

