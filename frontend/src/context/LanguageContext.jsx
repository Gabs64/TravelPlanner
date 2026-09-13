import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import translations from "../translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  const changeLanguage = useCallback((newLang) => {
    setLanguageState(newLang);
    localStorage.setItem("language", newLang);
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: newLang }));
  }, []);

  useEffect(() => {
    const handleLangChangeEvent = (e) => {
      if (e.detail && e.detail !== language) {
        setLanguageState(e.detail);
      }
    };
    window.addEventListener("languageChanged", handleLangChangeEvent);
    return () => {
      window.removeEventListener("languageChanged", handleLangChangeEvent);
    };
  }, [language]);

  const t = useCallback((key, fallback) => {
    const langDict = translations[language] || translations["en"];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const fallbackDict = translations["en"];
    if (fallbackDict && fallbackDict[key] !== undefined) {
      return fallbackDict[key];
    }
    return fallback || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
