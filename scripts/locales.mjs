export const locales = ["en", "ar"];
export const localeRoot = "locales";

export const localeDirectory = (locale) => `${localeRoot}/${locale}`;
export const localeRoute = (locale, path = "") =>
  `/${localeDirectory(locale)}${path}`;

export const localeFromFile = (file) =>
  locales.find((locale) => file.startsWith(`${localeDirectory(locale)}/`));
