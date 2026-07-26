import { createContext, useContext, useMemo, type ReactNode } from "react";
import { dict, type Dict } from "./dict";
import { pathFor, type Locale, type RouteKey } from "./routes";

type LocaleValue = {
  locale: Locale;
  t: Dict;
  path: (key: RouteKey) => string;
};

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<LocaleValue>(
    () => ({ locale, t: dict[locale], path: (key) => pathFor(key, locale) }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale jālieto iekšā LocaleProvider");
  return ctx;
}
