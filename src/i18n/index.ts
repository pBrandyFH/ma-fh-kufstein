import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import enTranslation from "./locales/en.json"
// import deTranslation from "./locales/de.json"
// import frTranslation from "./locales/fr.json"
// import itTranslation from "./locales/it.json"

const resources = {
  en: {
    translation: enTranslation,
  },
  // de: {
  //   translation: deTranslation,
  // },
  // fr: {
  //   translation: frTranslation,
  // },
  // it: {
  //   translation: itTranslation,
  // },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })

export default i18n

