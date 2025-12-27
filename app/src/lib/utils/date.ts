import { useSettingsStore } from "@/store/settingsStore";

export const formatDate = (date: string | Date, format?: string): string => {
  const settings = useSettingsStore.getState().settings;
  const dateFormat = format || settings.workspace.dateFormat;
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return date.toString();
  }

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  switch (dateFormat) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD.MM.YYYY":
      return `${day}.${month}.${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

export const parseDate = (dateString: string, format?: string): Date | null => {
  const settings = useSettingsStore.getState().settings;
  const dateFormat = format || settings.workspace.dateFormat;

  let day: string, month: string, year: string;

  if (dateFormat === "DD/MM/YYYY" || dateFormat === "DD.MM.YYYY") {
    const separator = dateFormat.includes("/") ? "/" : ".";
    const parts = dateString.split(separator);
    if (parts.length !== 3) return null;
    [day, month, year] = parts;
  } else if (dateFormat === "MM/DD/YYYY") {
    const parts = dateString.split("/");
    if (parts.length !== 3) return null;
    [month, day, year] = parts;
  } else if (dateFormat === "YYYY-MM-DD") {
    const parts = dateString.split("-");
    if (parts.length !== 3) return null;
    [year, month, day] = parts;
  } else {
    return null;
  }

  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  if (isNaN(date.getTime())) return null;
  return date;
};

export const getFiscalYear = (date: Date = new Date()): number => {
  const settings = useSettingsStore.getState().settings;
  const [month, day] = settings.workspace.fiscalYearStart.split("-").map(Number);
  const fiscalYearStart = new Date(date.getFullYear(), month - 1, day);

  if (date >= fiscalYearStart) {
    return date.getFullYear();
  } else {
    return date.getFullYear() - 1;
  }
};

export const getFiscalYearStart = (year?: number): Date => {
  const settings = useSettingsStore.getState().settings;
  const [month, day] = settings.workspace.fiscalYearStart.split("-").map(Number);
  const targetYear = year || getFiscalYear();
  return new Date(targetYear, month - 1, day);
};

export const getFiscalYearEnd = (year?: number): Date => {
  const start = getFiscalYearStart(year);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  end.setDate(end.getDate() - 1);
  return end;
};
