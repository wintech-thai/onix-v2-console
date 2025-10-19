// src/libs/i18n/i18n.ts
import { Resource, createInstance, i18n } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next/initReactI18next";
import { i18nConfig } from "./i18n-config";

export type i18nKeys = "common" | "product" | "auth" | "scan-item";
export const i18nNamespaces: i18nKeys[] = ["common", "product", "auth", "scan-item"];

export default async function initTranslations(
  locale: string,
  namespaces: i18nKeys[],
  i18nInstance?: i18n,
  resources?: Resource
) {
  const ns = namespaces.length > 0 ? namespaces : i18nNamespaces;
  const defaultNS = ns[0] ?? "common";

  i18nInstance = i18nInstance || createInstance();

  if (typeof window !== "undefined") {
    i18nInstance.use(LanguageDetector);
  }

  i18nInstance.use(initReactI18next);

  if (!resources) {
    i18nInstance.use(
      resourcesToBackend((language: string, namespace: string) =>
        import(`@/locales/${language}/${namespace}.json`)
      )
    );
  }

  await i18nInstance.init({
    ns,
    lng: locale,
    resources,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS,
    fallbackNS: defaultNS,
    preload: resources ? [] : i18nConfig.locales,
    interpolation: { escapeValue: false },

    detection:
      typeof window !== "undefined"
        ? {
          order: ["cookie", "htmlTag", "navigator"],
        }
        : undefined,

    initImmediate: false,
    returnNull: false,
  });

  return {
    t: i18nInstance.t,
    i18n: i18nInstance,
    resources: i18nInstance.services.resourceStore.data,
  };
}
